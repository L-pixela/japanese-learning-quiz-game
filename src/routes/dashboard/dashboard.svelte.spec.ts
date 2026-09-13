import { page } from 'vitest/browser'
import { describe, expect, it } from 'vitest'
import { render } from 'vitest-browser-svelte'
import Dashboard from './+page.svelte'
import { LEVELS } from '$lib/levels'
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
	leaderboard: [{ id: 'u2', username: 'Phourivath', points: 87, position: 1 }],
	levels: LEVELS.map((level) => ({
		...level,
		status: 'not_started',
		bestScore: 0,
		attempts: 0,
		updatedAt: null,
	})),
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
		await expect.element(page.getByText('Up next: Level 1 · First steps')).toBeInTheDocument()
	})
})
