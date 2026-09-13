import { describe, expect, it } from 'vitest'
import { load } from './+page.server'
import type { PageServerLoadEvent } from './$types'

const profileBody = {
	profile: { id: 'u1', username: 'alice', points: 42, streak: 3, rank: 'umeboshi' },
	history: [{ id: 'a1', level: 1, score: 8, submittedAt: '2024-01-01' }],
}
const leaderboardBody = { position: 7 }

const stubFetch = (path: string) =>
	({
		status: 200,
		ok: true,
		json: async () => (path.startsWith('/api/profile') ? profileBody : leaderboardBody),
	}) as Response

describe('profile load', () => {
	it('merges the profile and leaderboard position into one result', async () => {
		const result = await load({ fetch: stubFetch } as unknown as PageServerLoadEvent)
		expect(result).toEqual({
			profile: profileBody.profile,
			history: profileBody.history,
			position: leaderboardBody.position,
		})
	})
})
