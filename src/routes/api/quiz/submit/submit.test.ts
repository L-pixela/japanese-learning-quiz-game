import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { POST } from './+server'
import { createTestD1 } from '$lib/server/db/test-d1'
import type { RequestEvent } from './$types'

describe('POST /api/quiz/submit', () => {
	let db: ReturnType<typeof createTestD1>
	beforeEach(() => {
		db = createTestD1()
		db.sqlite.exec(
			"INSERT INTO user(id,username,password_hash) VALUES ('u1','alice','hash'),('u2','bob','hash')",
		)
		db.sqlite
			.prepare('INSERT INTO quiz_attempt(id,user_id,level,questions,created_at) VALUES (?,?,?,?,?)')
			.run('a', 'u1', 3, JSON.stringify(Array.from({ length: 10 }, () => ({ correctIndex: 0 }))), 1)
	})
	afterEach(() => db.sqlite.close())
	function event(body: unknown, userId: string | null = 'u1') {
		return {
			locals: { user: userId ? { id: userId } : null },
			platform: { env: { DB: db.d1 } },
			request: new Request('http://localhost/api/quiz/submit', {
				method: 'POST',
				body: JSON.stringify(body),
			}),
		} as RequestEvent
	}
	it('requires authentication', async () => {
		expect((await POST(event({ attemptId: 'a', answers: Array(10).fill(0) }, null))).status).toBe(
			401,
		)
	})
	it('rejects client-supplied scores and malformed requests', async () => {
		for (const body of [
			null,
			{ userId: 'u2', correctCount: 10, totalCount: 10 },
			{ attemptId: 'a', answers: [0] },
			{ attemptId: 'a', answers: Array(10).fill(0.5) },
		]) {
			expect((await POST(event(body))).status).toBe(400)
		}
	})
	it('cannot submit another user’s attempt', async () => {
		expect((await POST(event({ attemptId: 'a', answers: Array(10).fill(0) }, 'u2'))).status).toBe(
			404,
		)
	})
	it('scores on the server, passes at 60%, ignores supplied userId and safely replays', async () => {
		const body = {
			attemptId: 'a',
			answers: [0, 0, 0, 0, 0, 0, 1, 1, 1, 1],
			correctCount: 10,
			userId: 'u2',
		}
		const response = await POST(event(body))
		expect(response.status).toBe(200)
		expect(await response.json()).toMatchObject({
			level: 3,
			difficulty: 'Easy',
			score: 6,
			pointsEarned: 6,
			passed: true,
		})
		expect(await (await POST(event(body))).json()).toMatchObject({ score: 6, user: { points: 6 } })
		expect(
			db.sqlite.prepare('SELECT best_score,attempts,status FROM user_level_progress').get(),
		).toMatchObject({ best_score: 6, attempts: 1, status: 'completed' })
	})
})
