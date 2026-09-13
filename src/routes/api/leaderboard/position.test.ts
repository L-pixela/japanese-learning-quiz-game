import { afterEach, beforeEach, expect, it } from 'vitest'
import { GET } from './+server'
import { createTestD1 } from '$lib/server/db/test-d1'
import type { RequestEvent } from './$types'
let db: ReturnType<typeof createTestD1>
beforeEach(() => {
	db = createTestD1()
	for (let i = 0; i < 30; i++)
		db.sqlite
			.prepare('INSERT INTO user(id,username,password_hash,points,created_at) VALUES (?,?,?,?,?)')
			.run('u' + String(i).padStart(2, '0'), 'learner' + i, 'hash', 100 - i, 1)
})
afterEach(() => db.sqlite.close())
it('returns the viewer’s global position even outside the requested page', async () => {
	const response = await GET({
		locals: { user: { id: 'u29' } },
		platform: { env: { DB: db.d1 } },
		url: new URL('http://localhost/api/leaderboard?pageSize=5&withPosition=true'),
	} as RequestEvent)
	const body = (await response.json()) as { position: number; leaderboard: unknown[] }
	expect(body.position).toBe(30)
	expect(body.leaderboard).toHaveLength(5)
})
it('treats a null created_at as the oldest possible tiebreaker', async () => {
	db.sqlite
		.prepare('INSERT INTO user(id,username,password_hash,points,created_at) VALUES (?,?,?,?,?)')
		.run('u-null', 'nullcreated', 'hash', 100, null)
	const response = await GET({
		locals: { user: { id: 'u-null' } },
		platform: { env: { DB: db.d1 } },
		url: new URL('http://localhost/api/leaderboard?withPosition=true'),
	} as RequestEvent)
	const body = (await response.json()) as { position: number }
	expect(body.position).toBe(1)
})
it('returns a null position when the viewer has no matching user row', async () => {
	const response = await GET({
		locals: { user: { id: 'ghost' } },
		platform: { env: { DB: db.d1 } },
		url: new URL('http://localhost/api/leaderboard?withPosition=true'),
	} as RequestEvent)
	const body = (await response.json()) as { position: number | null }
	expect(body.position).toBeNull()
})
it('uses the same deterministic tiebreakers for page rows and viewer position', async () => {
	db.sqlite.exec('UPDATE user SET points=0, streak=0, created_at=1')
	const response = await GET({
		locals: { user: { id: 'u02' } },
		platform: { env: { DB: db.d1 } },
		url: new URL('http://localhost/api/leaderboard?pageSize=5&withPosition=true'),
	} as RequestEvent)
	const body = (await response.json()) as {
		position: number
		leaderboard: Array<{ id: string; position: number }>
	}
	expect(body.position).toBe(3)
	expect(body.leaderboard[2]).toMatchObject({ id: 'u02', position: 3 })
})
