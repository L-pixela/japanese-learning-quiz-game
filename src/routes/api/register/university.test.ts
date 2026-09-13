import { afterEach, beforeEach, expect, it } from 'vitest'
import { POST } from './+server'
import { createTestD1 } from '$lib/server/db/test-d1'
import type { RequestEvent } from './$types'
let db: ReturnType<typeof createTestD1>
beforeEach(() => {
	db = createTestD1()
})
afterEach(() => db.sqlite.close())
const request = (body: unknown) =>
	({
		request: new Request('http://localhost/api/register', {
			method: 'POST',
			body: JSON.stringify(body),
		}),
		platform: { env: { DB: db.d1 } },
	}) as RequestEvent
it('stores a trimmed university while keeping it optional', async () => {
	for (const [username, university, stored] of [
		['alice', '  Iwasaki  ', 'Iwasaki'],
		['bob', undefined, null],
	] as const) {
		expect((await POST(request({ username, password: 'test-password', university }))).status).toBe(
			201,
		)
		expect(
			db.sqlite.prepare('SELECT university FROM user WHERE username=?').get(username)?.university,
		).toBe(stored)
	}
})
it('rejects non-text and excessively long university names', async () => {
	for (const university of [123, {}, 'x'.repeat(201)])
		expect(
			(await POST(request({ username: 'alice', password: 'test-password', university }))).status,
		).toBe(400)
})
