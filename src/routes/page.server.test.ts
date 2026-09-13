import { describe, expect, it } from 'vitest'
import { load } from './+page.server'
import type { PageServerLoadEvent } from './$types'

const event = (user = true) =>
	({ locals: { user: user ? { id: 'u1' } : null } }) as unknown as PageServerLoadEvent

describe('/ (root) load', () => {
	it('redirects signed-in visitors to the dashboard', () => {
		expect.assertions(1)
		try {
			load(event(true))
		} catch (thrown) {
			expect(thrown).toMatchObject({ status: 303, location: '/dashboard' })
		}
	})

	it('redirects signed-out visitors to login', () => {
		expect.assertions(1)
		try {
			load(event(false))
		} catch (thrown) {
			expect(thrown).toMatchObject({ status: 303, location: '/login' })
		}
	})
})
