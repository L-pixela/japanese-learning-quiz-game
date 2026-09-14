import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { GET } from './+server'
import { createTestD1 } from '$lib/server/db/test-d1'
import type { RequestEvent } from './$types'

describe('/api/profile/:id', () => {
	let db: ReturnType<typeof createTestD1>

	beforeEach(() => {
		db = createTestD1()
		db.sqlite.exec(
			"INSERT INTO user(id,username,password_hash,display_name,university,phone,bio,points,streak,rank) VALUES ('u2','bob','hash','Bob B.','RUPP','012345678','Learning N3.',87,9,'hinotama')",
		)
	})
	afterEach(() => db.sqlite.close())

	const event = (id: string, loggedIn = true) =>
		({
			locals: { user: loggedIn ? { id: 'u1' } : null },
			params: { id },
			platform: { env: { DB: db.d1 } },
		}) as RequestEvent

	it('requires a session', async () => {
		const response = await GET(event('u2', false))
		expect(response.status).toBe(401)
	})

	it('returns a learner profile without private contact data', async () => {
		const response = await GET(event('u2'))
		const body = (await response.json()) as { profile: Record<string, unknown> }

		expect(response.status).toBe(200)
		expect(body.profile).toMatchObject({
			id: 'u2',
			username: 'bob',
			displayName: 'Bob B.',
			university: 'RUPP',
			bio: 'Learning N3.',
			points: 87,
			streak: 9,
			rank: 'hinotama',
		})
		expect(body.profile).not.toHaveProperty('phone')
		expect(body.profile).not.toHaveProperty('passwordHash')
	})

	it('returns 404 for an unknown learner', async () => {
		const response = await GET(event('missing'))
		expect(response.status).toBe(404)
	})
})
