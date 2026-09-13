import { page } from 'vitest/browser'
import { describe, expect, it } from 'vitest'
import { render } from 'vitest-browser-svelte'
import Dashboard from './+page.svelte'
import type { PageData } from './$types'

const data: PageData = {
	user: {
		id: 'u1',
		username: 'Bunleap',
		university: 'Iwasaki',
		points: 42,
		streak: 3,
		rank: 'umeboshi',
	},
	position: 27,
	leaderboard: [
		{ id: 'u2', username: 'Phourivath', university: 'RUPP', points: 87, streak: 9, position: 1 },
		{ id: 'u1', username: 'Bunleap', university: 'Iwasaki', points: 42, streak: 3, position: 2 },
		{ id: 'u3', username: 'Sreysor', university: null, points: 12, streak: 0, position: 3 },
	],
}
describe('Dashboard', () => {
	it('shows live profile values and a position outside the visible leaderboard page', async () => {
		render(Dashboard, { data })
		await expect
			.element(page.getByRole('heading', { name: 'Welcome back, Bunleap.' }))
			.toBeInTheDocument()
		await expect.element(page.getByText('#27', { exact: true })).toBeInTheDocument()
		await expect.element(page.getByText('42', { exact: true })).toBeInTheDocument()
		await expect.element(page.getByText('梅干し · Umeboshi', { exact: true })).toBeInTheDocument()
	})
	it('puts quiz practice first while retaining a secondary deck link', async () => {
		render(Dashboard, { data })
		await expect
			.element(page.getByRole('link', { name: 'Start Quiz' }))
			.toHaveAttribute('href', '/quiz')
		await expect
			.element(page.getByRole('link', { name: /Prefer your own vocabulary/ }))
			.toHaveAttribute('href', '/deck_list')
	})
	it('ranks learners with their university and marks the signed-in row', async () => {
		render(Dashboard, { data })
		await expect.element(page.getByText('Phourivath', { exact: true })).toBeInTheDocument()
		await expect.element(page.getByText('RUPP', { exact: true })).toBeInTheDocument()
		await expect.element(page.getByText('87', { exact: true })).toBeInTheDocument()
		await expect.element(page.getByText('you', { exact: true })).toBeInTheDocument()
		// A learner who never entered a university still gets a row.
		await expect.element(page.getByText('Sreysor', { exact: true })).toBeInTheDocument()
		await expect.element(page.getByText('·', { exact: true })).toBeInTheDocument()
	})
})
