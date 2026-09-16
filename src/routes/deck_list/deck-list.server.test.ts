import { describe, expect, it } from 'vitest'
import { redirect } from '@sveltejs/kit'
import { load } from './+page.server'
import type { PageServerLoadEvent } from './$types'

const event = (search = '') =>
	({ url: { searchParams: new URLSearchParams(search) } }) as unknown as PageServerLoadEvent

/** The thrown value from `redirect()`, so the target can be asserted. */
function caught(search: string) {
	try {
		load(event(search))
	} catch (thrown) {
		return thrown as ReturnType<typeof redirect> & { status: number; location: string }
	}
	throw new Error('expected a redirect')
}

describe('deck_list redirect', () => {
	it('sends the bare deck link to level 1', () => {
		expect(caught('')).toMatchObject({ status: 308, location: '/quiz/1' })
	})
	it('keeps the requested level', () => {
		expect(caught('level=7')).toMatchObject({ status: 308, location: '/quiz/7' })
	})
	it('falls back to level 1 for out-of-range or junk levels', () => {
		for (const search of ['level=0', 'level=11', 'level=abc', 'level=1.5'])
			expect(caught(search)).toMatchObject({ location: '/quiz/1' })
	})
})
