import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { GET, PATCH } from './+server'
import { createTestD1 } from '$lib/server/db/test-d1'
import type { RequestEvent } from './$types'

describe('/api/profile', () => {
	let db: ReturnType<typeof createTestD1>
	beforeEach(() => {
		db = createTestD1()
		db.sqlite.exec(
			"INSERT INTO user(id,username,password_hash,points,streak,rank) VALUES ('u1','alice','hash',42,3,'umeboshi')",
		)
	})
	afterEach(() => db.sqlite.close())

	const event = (d1: D1Database, body?: unknown, user = true) =>
		({
			locals: { user: user ? { id: 'u1' } : null },
			platform: { env: { DB: d1 } },
			request: { json: async () => body },
		}) as RequestEvent

	it('requires a session for both reading and writing', async () => {
		expect((await GET(event(db.d1, undefined, false))).status).toBe(401)
		expect((await PATCH(event(db.d1, { phone: '012' }, false))).status).toBe(401)
	})

	it('returns the profile with standing and an empty history', async () => {
		const body = (await (await GET(event(db.d1))).json()) as {
			profile: { username: string; points: number; rank: string; phone: string | null }
			history: unknown[]
		}
		expect(body.profile).toMatchObject({ username: 'alice', points: 42, rank: 'umeboshi' })
		expect(body.profile.phone).toBeNull()
		expect(body.history).toEqual([])
	})

	it('saves the editable fields and trims whitespace', async () => {
		const response = await PATCH(
			event(db.d1, {
				displayName: '  Alice A.  ',
				university: 'CADT',
				phone: '012 345 678',
				linkedin: 'alice-a',
				github: 'alice',
				bio: 'Learning N4.',
			}),
		)
		expect(response.status).toBe(200)
		const body = (await (await GET(event(db.d1))).json()) as {
			profile: Record<string, string>
		}
		expect(body.profile.displayName).toBe('Alice A.')
		expect(body.profile.github).toBe('alice')
		expect(body.profile.bio).toBe('Learning N4.')
	})

	it('clears a field when given an empty string', async () => {
		await PATCH(event(db.d1, { phone: '012' }))
		await PATCH(event(db.d1, { phone: '   ' }))
		const body = (await (await GET(event(db.d1))).json()) as { profile: { phone: null } }
		expect(body.profile.phone).toBeNull()
	})

	it('rejects an over-long value rather than truncating it', async () => {
		const response = await PATCH(event(db.d1, { displayName: 'x'.repeat(61) }))
		expect(response.status).toBe(400)
		const body = (await (await GET(event(db.d1))).json()) as { profile: { displayName: null } }
		expect(body.profile.displayName).toBeNull()
	})

	it('rejects a body with nothing editable in it', async () => {
		expect((await PATCH(event(db.d1, { points: 9999 }))).status).toBe(400)
		const body = (await (await GET(event(db.d1))).json()) as { profile: { points: number } }
		expect(body.profile.points).toBe(42)
	})

	it('accepts a bundled path or an inline image, and rejects anything else', async () => {
		expect((await PATCH(event(db.d1, { avatar: '/team/bunleap.webp' }))).status).toBe(200)
		const inline = 'data:image/webp;base64,UklGRh4AAABXRUJQ'
		expect((await PATCH(event(db.d1, { avatar: inline }))).status).toBe(200)
		expect((await PATCH(event(db.d1, { avatar: 'https://evil.example/x.png' }))).status).toBe(400)
		expect((await PATCH(event(db.d1, { avatar: 'javascript:alert(1)' }))).status).toBe(400)
		const body = (await (await GET(event(db.d1))).json()) as { profile: { avatar: string } }
		expect(body.profile.avatar).toBe(inline)
	})

	it('rejects an oversized image instead of storing it', async () => {
		const huge = 'data:image/png;base64,' + 'A'.repeat(256 * 1024)
		expect((await PATCH(event(db.d1, { avatar: huge }))).status).toBe(400)
		const body = (await (await GET(event(db.d1))).json()) as { profile: { avatar: null } }
		expect(body.profile.avatar).toBeNull()
	})

	it('clears the photo when given an empty string', async () => {
		await PATCH(event(db.d1, { avatar: '/team/bunleap.webp' }))
		await PATCH(event(db.d1, { avatar: '' }))
		const body = (await (await GET(event(db.d1))).json()) as { profile: { avatar: null } }
		expect(body.profile.avatar).toBeNull()
	})

	it('lists only finished quizzes, newest first', async () => {
		db.sqlite.exec(
			'INSERT INTO quiz_attempt(id,user_id,level,questions,score,created_at,submitted_at) VALUES ' +
				"('a1','u1',1,'[]',7,100,110)," +
				"('a2','u1',3,'[]',9,200,210)," +
				"('a3','u1',5,'[]',NULL,300,NULL)",
		)
		const body = (await (await GET(event(db.d1))).json()) as {
			history: Array<{ level: number; score: number }>
		}
		expect(body.history.map((row) => row.level)).toEqual([3, 1])
		expect(body.history[0].score).toBe(9)
	})
})
