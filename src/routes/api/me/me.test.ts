import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { GET } from './+server'
import { createTestD1 } from '$lib/server/db/test-d1'
import type { RequestEvent } from './$types'

describe('GET /api/me', () => {
	let db: ReturnType<typeof createTestD1>
	beforeEach(() => {
		db = createTestD1()
		db.sqlite.exec(
			"INSERT INTO user(id,username,university,points,streak,rank,password_hash) VALUES ('u1','alice','CADT',42,3,'umeboshi','hash')",
		)
	})
	afterEach(() => db.sqlite.close())

	const event = (d1: D1Database, user = true) =>
		({
			locals: { user: user ? { id: 'u1' } : null },
			platform: { env: { DB: d1 } },
		}) as RequestEvent

	it('requires a session', async () => {
		expect((await GET(event(db.d1, false))).status).toBe(401)
	})

	it('returns 404 when the session user has no matching row', async () => {
		db.sqlite.exec("DELETE FROM user WHERE id = 'u1'")
		expect((await GET(event(db.d1))).status).toBe(404)
	})

	it('returns the signed-in user’s profile', async () => {
		const response = await GET(event(db.d1))
		const body = (await response.json()) as {
			user: {
				id: string
				username: string
				university: string | null
				points: number
				streak: number
				rank: string
			}
		}
		expect(body.user).toEqual({
			id: 'u1',
			username: 'alice',
			university: 'CADT',
			points: 42,
			streak: 3,
			rank: 'umeboshi',
		})
	})
})
