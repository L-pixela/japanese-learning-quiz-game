import { describe, expect, it } from 'vitest'
import { load } from './+page.server'
import type { PageServerLoadEvent } from './$types'

const profileBody = {
	profile: { id: 'u1', username: 'alice', points: 42, streak: 3, rank: 'umeboshi' },
	history: [{ id: 'a1', level: 1, score: 8, submittedAt: '2024-01-01' }],
}

/**
 * The load makes up to three calls: the profile, page 1 of the board (which
 * carries our own position and the leader's points), and — when we are not
 * already first — the single row directly above us.
 */
function stubFetch(leaderboards: Record<string, unknown>) {
	const calls: string[] = []
	const fetcher = (path: string) => {
		calls.push(path)
		const body = path.startsWith('/api/profile') ? profileBody : leaderboards[path]
		return { status: 200, ok: true, json: async () => body } as Response
	}
	return { fetcher, calls }
}

/** The generated load type allows void; every path here returns data. */
const loadProfile = (fetcher: (path: string) => Response) =>
	load({ fetch: fetcher } as unknown as PageServerLoadEvent) as Promise<
		Exclude<Awaited<ReturnType<typeof load>>, void>
	>

describe('profile load', () => {
	it('merges the profile, position and the two point gaps into one result', async () => {
		const { fetcher, calls } = stubFetch({
			'/api/leaderboard?pageSize=1&withPosition=true': {
				position: 7,
				leaderboard: [{ position: 1, id: 'u9', username: 'top', points: 900 }],
			},
			'/api/leaderboard?page=6&pageSize=1': {
				leaderboard: [{ position: 6, id: 'u6', username: 'sixth', points: 120 }],
			},
		})
		const result = await loadProfile(fetcher)

		expect(result).toEqual({
			profile: profileBody.profile,
			history: profileBody.history,
			position: 7,
			leaderPoints: 900,
			nextUp: { position: 6, username: 'sixth', points: 120 },
		})
		expect(calls).toContain('/api/leaderboard?page=6&pageSize=1')
	})

	it('skips the extra request when the learner already holds first place', async () => {
		const { fetcher, calls } = stubFetch({
			'/api/leaderboard?pageSize=1&withPosition=true': {
				position: 1,
				leaderboard: [{ position: 1, id: 'u1', username: 'alice', points: 42 }],
			},
		})
		const result = await loadProfile(fetcher)

		expect(result.position).toBe(1)
		expect(result.nextUp).toBeNull()
		expect(calls).toHaveLength(2)
	})

	it('reports no gaps when the learner is unranked', async () => {
		const { fetcher } = stubFetch({
			'/api/leaderboard?pageSize=1&withPosition=true': { position: null, leaderboard: [] },
		})
		const result = await loadProfile(fetcher)

		expect(result.position).toBeNull()
		expect(result.leaderPoints).toBeNull()
		expect(result.nextUp).toBeNull()
	})
})
