import { describe, expect, it } from 'vitest'
import { load } from './+page.server'
import type { PageServerLoadEvent } from './$types'

describe('quiz load', () => {
	it('passes through the levels returned by the API', async () => {
		const levels = [{ level: 1, status: 'not_started', bestScore: 0, attempts: 0 }]
		const stubFetch = (async () => ({
			status: 200,
			ok: true,
			json: async () => ({ levels }),
		})) as unknown as typeof fetch

		const result = await load({ fetch: stubFetch } as unknown as PageServerLoadEvent)
		expect(result).toEqual({ levels })
	})
})
