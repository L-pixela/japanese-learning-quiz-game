import { page } from 'vitest/browser'
import { describe, expect, it } from 'vitest'
import { render } from 'vitest-browser-svelte'
import RankBadge from './rank_badge.svelte'

import { RANKS, getNextRank, getRankFromPoints, getRankProgress } from './ranks'

describe('RankBadge.svelte', () => {
	it('renders the default rank without a label', async () => {
		render(RankBadge)

		await expect
			.element(page.getByRole('img', { name: 'Shiragohan rank badge' }))
			.toBeInTheDocument()
		await expect.element(page.getByText('Shiragohan')).not.toBeInTheDocument()
	})

	it('resolves a rank from points and displays its label', async () => {
		render(RankBadge, { points: 45, size: 'lg', showLabel: true })

		await expect
			.element(page.getByRole('img', { name: 'Ichimi Togarashi rank badge' }))
			.toBeInTheDocument()
		await expect.element(page.getByText('Ichimi Togarashi')).toBeInTheDocument()
		await expect.element(page.getByText('一味唐辛子')).toBeInTheDocument()
		await expect.element(page.getByAltText('Ichimi Togarashi')).toBeInTheDocument()
	})

	it('uses a supplied rank and applies the small size', async () => {
		render(RankBadge, { rank: RANKS[6], size: 'sm' })

		const badge = page.getByRole('img', { name: 'Hinotama rank badge' })
		await expect.element(badge).toBeInTheDocument()
		await expect.element(badge).toHaveClass('rank-badge--sm')
	})
})

describe('rank utilities', () => {
	it('maps points boundaries and negative points to the correct ranks', () => {
		expect(getRankFromPoints(-1)).toBe(RANKS[0])
		expect(getRankFromPoints(9)).toBe(RANKS[0])
		expect(getRankFromPoints(10)).toBe(RANKS[1])
		expect(getRankFromPoints(120)).toBe(RANKS[6])
	})

	it('returns the next rank and progress details', () => {
		expect(getNextRank(RANKS[0])).toBe(RANKS[1])
		expect(getNextRank(RANKS[6])).toBeNull()
		expect(getNextRank({ ...RANKS[0], id: 'unknown' })).toBeNull()
		expect(getRankProgress(12)).toEqual({
			fraction: 0.2,
			pointsToNext: 8,
			next: RANKS[2],
		})
		expect(getRankProgress(120)).toBeNull()
	})
})
