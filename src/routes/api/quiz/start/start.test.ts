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
	it('asks all three directions and never exposes the answer key', async () => {
		const response = await POST(event(2))
		const body = (await response.json()) as {
			attemptId: string
			level: number
			questions: Array<{
				type: string
				japanese: string | null
				reading: string | null
				meaning: string | null
				options: string[]
				correctIndex?: number
			}>
		}
		expect(response.status).toBe(201)
		expect(body.level).toBe(2)
		expect(body.questions).toHaveLength(10)

		// A quiz that only ever asks one direction is the thing this replaced.
		expect(new Set(body.questions.map((q) => q.type))).toEqual(
			new Set(['meaning', 'word', 'reading']),
		)
		expect(body.questions.every((q) => q.correctIndex === undefined)).toBe(true)
		expect(body.questions.every((q) => new Set(q.options).size === 4)).toBe(true)

		// The prompt must never contain what it is asking you to choose.
		for (const q of body.questions) {
			if (q.type === 'reading') expect(q.reading).toBeNull()
			if (q.type === 'word') expect(q.japanese).toBeNull()
			if (q.type === 'meaning') expect(q.meaning).toBeNull()
		}

		// The stored key is consistent: the answer really is one of the options.
		const stored = db.sqlite
			.prepare('SELECT questions FROM quiz_attempt WHERE id=?')
			.get(body.attemptId) as { questions: string }
		const key = JSON.parse(stored.questions) as Array<{
			type: 'meaning' | 'word' | 'reading'
			japanese: string
			reading: string
			meaning: string
			options: string[]
			correctIndex: number
		}>
		expect(key).toHaveLength(10)
		for (const q of key) {
			const expected = { meaning: q.meaning, word: q.japanese, reading: q.reading }[q.type]
			expect(q.options[q.correctIndex]).toBe(expected)
		}
		expect(new Set(key.map((q) => q.japanese)).size).toBe(10)
		expect(
			db.sqlite.prepare('SELECT user_id,level FROM quiz_attempt WHERE id=?').get(body.attemptId),
		).toMatchObject({ user_id: 'u1', level: 2 })
	})

	it('falls back to meaning questions for words written only in kana', async () => {
		// japanese === reading, so there is no reading left to ask about.
		db.sqlite.exec('DELETE FROM word')
		for (let i = 0; i < 40; i++)
			db.sqlite
				.prepare('INSERT INTO word VALUES (?,?,?,?,?)')
				.run('k' + i, 'kana' + i, 'kana' + i, 'meaning' + i, 2)

		const body = (await (await POST(event(2))).json()) as {
			questions: Array<{ type: string }>
		}
		expect(body.questions.some((q) => q.type === 'reading')).toBe(false)
		expect(body.questions).toHaveLength(10)
	})
})
