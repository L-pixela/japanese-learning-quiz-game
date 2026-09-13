import { describe, expect, it } from 'vitest'
import { load } from './+page.server'
import type { PageServerLoadEvent } from './$types'

const profileBody = {
	user: {
		id: 'u1',
		username: 'alice',
		university: 'Tokyo Tech',
		points: 42,
		streak: 3,
		rank: 'umeboshi',
	},
}
const leaderboardBody = {
	leaderboard: [
		{
			id: 'u1',
			username: 'alice',
			university: 'Tokyo Tech',
			points: 42,
			streak: 3,
			position: 1,
		},
	],
	position: 1,
}

const stubFetch = (path: string) =>
	({
		status: 200,
		ok: true,
		json: async () => (path.startsWith('/api/me') ? profileBody : leaderboardBody),
	}) as Response

describe('dashboard load', () => {
	it('merges the profile and leaderboard results into one result', async () => {
		const result = await load({ fetch: stubFetch } as unknown as PageServerLoadEvent)
		expect(result).toEqual({
			user: profileBody.user,
			leaderboard: leaderboardBody.leaderboard,
			position: leaderboardBody.position,
		})
	})
})
