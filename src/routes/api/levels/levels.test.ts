import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { GET } from './+server'
import { createTestD1 } from '$lib/server/db/test-d1'
import type { RequestEvent } from './$types'
describe('GET /api/levels', () => {
	let db: ReturnType<typeof createTestD1>
	beforeEach(() => {
		db = createTestD1()
		db.sqlite.exec(
			"INSERT INTO user(id,username,password_hash) VALUES ('u1','alice','hash'),('u2','bob','hash')",
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
	it('returns ten unstarted levels for a new learner', async () => {
		const response = await GET(event(db.d1))
		const body = (await response.json()) as {
			levels: Array<{ level: number; status: string; attempts: number }>
		}
		expect(body.levels).toHaveLength(10)
		expect(body.levels.map((level) => level.level)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
		expect(
			body.levels.every((level) => level.status === 'not_started' && level.attempts === 0),
		).toBe(true)
	})
	it('merges only the signed-in user’s progress and difficulty bands', async () => {
		db.sqlite.exec(
			"INSERT INTO user_level_progress VALUES ('u1',4,'completed',8,2,1),('u2',1,'completed',10,1,1)",
		)
		const body = (await (await GET(event(db.d1))).json()) as {
			levels: Array<{ status: string; difficulty: string; bestScore: number; attempts: number }>
		}
		expect(body.levels[0].status).toBe('not_started')
		expect(body.levels[3]).toMatchObject({
			status: 'completed',
			bestScore: 8,
			attempts: 2,
			difficulty: 'Medium',
		})
		expect(body.levels[9].difficulty).toBe('Hard')
	})
})
