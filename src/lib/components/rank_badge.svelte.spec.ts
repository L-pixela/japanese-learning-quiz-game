import { page } from 'vitest/browser'
import { describe, expect, it } from 'vitest'
import { render } from 'vitest-browser-svelte'
import RankBadge from './rank_badge.svelte'

import { RANKS, getNextRank, getRankFromStreak, getRankProgress } from './ranks'

describe('RankBadge.svelte', () => {
	it('renders the default rank without a label', async () => {
		render(RankBadge)

		await expect
			.element(page.getByRole('img', { name: 'Rice Bowl rank badge' }))
			.toBeInTheDocument()
		await expect.element(page.getByText('Rice Bowl')).not.toBeInTheDocument()
	})

	it('resolves a rank from the streak and displays its label', async () => {
		render(RankBadge, { streak: 45, size: 'lg', showLabel: true })

		await expect.element(page.getByRole('img', { name: 'Takoyaki rank badge' })).toBeInTheDocument()
		await expect.element(page.getByText('Takoyaki')).toBeInTheDocument()
		await expect.element(page.getByText('たこ焼き')).toBeInTheDocument()
		await expect.element(page.getByAltText('Takoyaki')).toBeInTheDocument()
	})

	it('uses a supplied rank and applies the small size', async () => {
		render(RankBadge, { rank: RANKS[6], size: 'sm' })

		const badge = page.getByRole('img', { name: 'Yakiniku rank badge' })
		await expect.element(badge).toBeInTheDocument()
		await expect.element(badge).toHaveClass('rank-badge--sm')
	})
})

describe('rank utilities', () => {
	it('maps streak boundaries and negative streaks to the correct ranks', () => {
		expect(getRankFromStreak(-1)).toBe(RANKS[0])
		expect(getRankFromStreak(2)).toBe(RANKS[0])
		expect(getRankFromStreak(3)).toBe(RANKS[1])
		expect(getRankFromStreak(120)).toBe(RANKS[6])
	})

	it('returns the next rank and progress details', () => {
		expect(getNextRank(RANKS[0])).toBe(RANKS[1])
		expect(getNextRank(RANKS[6])).toBeNull()
		expect(getNextRank({ ...RANKS[0], id: 'unknown' })).toBeNull()
		expect(getRankProgress(4)).toEqual({
			fraction: 1 / 4,
			daysToNext: 3,
			next: RANKS[2],
		})
		expect(getRankProgress(120)).toBeNull()
	})
})
