import { describe, expect, it } from 'vitest'
import { load } from './+page.server'
import { LEVELS } from '$lib/levels'
import type { PageServerLoadEvent } from './$types'

const event = (level: string, user = true) =>
	({
		locals: { user: user ? { id: 'u1' } : null },
		params: { level },
	}) as unknown as PageServerLoadEvent

describe('quiz/[level] load', () => {
	it('redirects to /login when signed out', () => {
		expect.assertions(1)
		try {
			load(event('1', false))
		} catch (thrown) {
			expect(thrown).toMatchObject({ status: 303, location: '/login' })
		}
	})

	it.each(['0', '11', 'abc'])('404s for an invalid level %s', (level) => {
		expect.assertions(1)
		try {
			load(event(level))
		} catch (thrown) {
			expect(thrown).toMatchObject({ status: 404 })
		}
	})

	it.each(['1', '10'])('returns the matching level for %s', (level) => {
		expect(load(event(level))).toEqual({ level: LEVELS[Number(level) - 1] })
	})
})
