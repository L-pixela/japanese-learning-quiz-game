import { describe, expect, it } from 'vitest'
import { load } from './+page.server'
import type { PageServerLoadEvent } from './$types'

const profileBody = {
	profile: { id: 'u2', username: 'bob', points: 87, streak: 9, rank: 'hinotama' },
}

describe('public profile load', () => {
	it('loads the profile identified by the route parameter', async () => {
		let requestedPath = ''
		const fetch = async (path: string) => {
			requestedPath = path
			return {
				status: 200,
				ok: true,
				json: async () => profileBody,
			} as Response
		}

		const result = await load({ fetch, params: { id: 'u2' } } as unknown as PageServerLoadEvent)

		expect(requestedPath).toBe('/api/profile/u2')
		expect(result).toEqual(profileBody)
	})
})
