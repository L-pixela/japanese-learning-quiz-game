import { page } from 'vitest/browser'
import { describe, expect, it } from 'vitest'
import { render } from 'vitest-browser-svelte'
import DeckPage from './+page.svelte'
import { LEVELS } from '$lib/levels'
import type { PageData } from './$types'

const words = [
	{ id: 'w1', japanese: '米', reading: 'こめ', meaning: 'uncooked rice' },
	{ id: 'w2', japanese: '味噌', reading: 'みそ', meaning: 'miso, bean paste' },
	{ id: 'w3', japanese: '眠る', reading: 'ねむる', meaning: 'to sleep' },
]

const data: PageData = {
	level: 1,
	count: words.length,
	words,
	levels: LEVELS.map((level) => ({
		...level,
		status: 'not_started',
		bestScore: 0,
		attempts: 0,
		updatedAt: null,
	})),
}

describe('My deck', () => {
	it('describes the selected level and how the quiz samples it', async () => {
		render(DeckPage, { data })
		await expect
			.element(page.getByRole('heading', { name: 'Study the words first.' }))
			.toBeInTheDocument()
		await expect.element(page.getByText('Level 01 · Easy')).toBeInTheDocument()
		await expect.element(page.getByText('words in this deck')).toBeInTheDocument()
		await expect.element(page.getByText('drawn per quiz')).toBeInTheDocument()
	})

	it('lists every word with its reading and meaning', async () => {
		render(DeckPage, { data })
		for (const word of words) {
			await expect.element(page.getByText(word.japanese, { exact: true })).toBeInTheDocument()
			await expect.element(page.getByText(word.reading, { exact: true })).toBeInTheDocument()
			await expect.element(page.getByText(word.meaning, { exact: true })).toBeInTheDocument()
		}
	})

	it('links to the quiz for the level being studied', async () => {
		render(DeckPage, { data })
		await expect
			.element(page.getByRole('link', { name: /Quiz this level/ }))
			.toHaveAttribute('href', '/quiz/1')
	})

	it('filters the deck by Japanese, reading or meaning', async () => {
		render(DeckPage, { data })
		await page.getByRole('searchbox', { name: 'Search this deck' }).fill('miso')
		await expect.element(page.getByText('味噌', { exact: true })).toBeInTheDocument()
		await expect.element(page.getByText('米', { exact: true })).not.toBeInTheDocument()
	})

	it('explains an empty search result without hiding the deck size', async () => {
		render(DeckPage, { data })
		await page.getByRole('searchbox', { name: 'Search this deck' }).fill('zzzz')
		await expect.element(page.getByText(/No word here matches/)).toBeInTheDocument()
	})
})
