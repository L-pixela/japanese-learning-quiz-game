import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { POST } from './+server'
import { createTestD1 } from '$lib/server/db/test-d1'
import type { RequestEvent } from './$types'
describe('POST /api/quiz/start', () => {
	let db: ReturnType<typeof createTestD1>
	beforeEach(() => {
		db = createTestD1()
		db.sqlite.exec("INSERT INTO user(id,username,password_hash) VALUES ('u1','alice','hash')")
		for (let i = 0; i < 55; i++)
			db.sqlite
				.prepare('INSERT INTO word VALUES (?,?,?,?,?)')
				.run('w' + i, 'word' + i, 'reading' + i, 'meaning' + i, 2)
	})
	afterEach(() => db.sqlite.close())
	function event(level: unknown, loggedIn = true) {
		return {
			locals: { user: loggedIn ? { id: 'u1' } : null },
			platform: { env: { DB: db.d1 } },
			request: new Request('http://localhost/api/quiz/start', {
				method: 'POST',
				body: JSON.stringify({ level }),
			}),
		} as RequestEvent
	}
	it('validates authentication, level and insufficient vocabulary', async () => {
		expect((await POST(event(2, false))).status).toBe(401)
		for (const level of [0, 11, 1.5, '2', null]) expect((await POST(event(level))).status).toBe(400)
		expect((await POST(event(1))).status).toBe(409)
	})
	it('draws ten distinct words from the level and never exposes answer keys', async () => {
		const response = await POST(event(2))
		const body = (await response.json()) as {
			attemptId: string
			level: number
			questions: Array<{ japanese: string; options: string[]; correctIndex?: number }>
		}
		expect(response.status).toBe(201)
		expect(body.level).toBe(2)
		expect(new Set(body.questions.map((q) => q.japanese)).size).toBe(10)
		expect(
			body.questions.every((q) => q.correctIndex === undefined && new Set(q.options).size === 4),
		).toBe(true)
		expect(
			db.sqlite.prepare('SELECT user_id,level FROM quiz_attempt WHERE id=?').get(body.attemptId),
		).toMatchObject({ user_id: 'u1', level: 2 })
	})
})
