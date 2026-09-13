import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { GET } from './+server'
import { createTestD1 } from '$lib/server/db/test-d1'
import type { RequestEvent } from './$types'

describe('GET /api/words', () => {
	let db: ReturnType<typeof createTestD1>
	beforeEach(() => {
		db = createTestD1()
		db.sqlite.exec("INSERT INTO user(id,username,password_hash) VALUES ('u1','alice','hash')")
		db.sqlite.exec(
			'INSERT INTO word(id,japanese,reading,meaning,level) VALUES ' +
				"('w2','米','こめ','uncooked rice',1)," +
				"('w1','味','あじ','flavor, taste',1)," +
				"('w3','空港','くうこう','airport',3)",
		)
	})
	afterEach(() => db.sqlite.close())

	const event = (d1: D1Database, level: string | null, user = true) =>
		({
			locals: { user: user ? { id: 'u1' } : null },
			platform: { env: { DB: d1 } },
			url: new URL('http://localhost/api/words' + (level === null ? '' : `?level=${level}`)),
		}) as RequestEvent

	it('requires a session', async () => {
		expect((await GET(event(db.d1, '1', false))).status).toBe(401)
	})

	it('rejects a missing or out-of-range level', async () => {
		for (const level of [null, '0', '11', 'abc', '1.5']) {
			expect((await GET(event(db.d1, level))).status).toBe(400)
		}
	})

	it('returns only the requested level, ordered by the Japanese form', async () => {
		const body = (await (await GET(event(db.d1, '1'))).json()) as {
			level: number
			count: number
			words: Array<{ japanese: string; reading: string; meaning: string }>
		}
		expect(body.level).toBe(1)
		expect(body.count).toBe(2)
		expect(body.words.map((w) => w.japanese)).toEqual(['米', '味'].sort())
		expect(body.words[0]).toMatchObject({
			reading: expect.any(String),
			meaning: expect.any(String),
		})
	})

	it('returns an empty set for a level with no seeded vocabulary', async () => {
		const body = (await (await GET(event(db.d1, '9'))).json()) as { count: number; words: [] }
		expect(body.count).toBe(0)
		expect(body.words).toEqual([])
	})
})
