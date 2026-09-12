import { page } from 'vitest/browser'
import { describe, expect, it, vi } from 'vitest'
import { render } from 'vitest-browser-svelte'
import DecksPage from './+page.svelte'
import { MOCK_DECKS } from '$lib/mock-data/decks'

vi.mock('$app/stores', () => ({
	page: {
		subscribe: (fn: (value: { url: URL }) => void) => {
			fn({ url: new URL('http://localhost/deck_list') })
			return () => {}
		},
	},
}))

describe('Deck Management +page.svelte', () => {
	it('renders the page header and create button', async () => {
		render(DecksPage)

		await expect.element(page.getByText('Deck Management')).toBeInTheDocument()
		await expect.element(page.getByRole('button', { name: '+ Create Deck' })).toBeInTheDocument()
	})

	it('renders the table headers', async () => {
		render(DecksPage)

		await expect.element(page.getByRole('columnheader', { name: 'Deck Title' })).toBeInTheDocument()
		await expect
			.element(page.getByRole('columnheader', { name: 'Cards', exact: true }))
			.toBeInTheDocument()
		await expect.element(page.getByRole('columnheader', { name: 'Status' })).toBeInTheDocument()
		await expect.element(page.getByRole('columnheader', { name: 'Actions' })).toBeInTheDocument()
	})

	it('renders every mock deck with title, card count, and status', async () => {
		render(DecksPage)

		for (const deck of MOCK_DECKS) {
			await expect.element(page.getByText(deck.title)).toBeInTheDocument()
			await expect.element(page.getByText(`${deck.cardCount} cards`)).toBeInTheDocument()
		}

		const statusPills = page.getByText('Active')
		await expect.element(statusPills.first()).toBeInTheDocument()
	})

	it('renders Edit and Delete actions for each deck', async () => {
		render(DecksPage)

		const editButtons = page.getByRole('button', { name: 'Edit' })
		const deleteButtons = page.getByRole('button', { name: 'Delete' })

		await expect.element(editButtons.first()).toBeInTheDocument()
		await expect.element(deleteButtons.first()).toBeInTheDocument()
	})

	it('filters decks by search query', async () => {
		render(DecksPage)

		const firstDeckTitle = MOCK_DECKS[0].title
		const otherDeckTitle = MOCK_DECKS[1].title

		const searchInput = page.getByPlaceholder('Search decks...')
		await searchInput.fill(firstDeckTitle)

		await expect.element(page.getByText(firstDeckTitle)).toBeInTheDocument()
		await expect.element(page.getByText(otherDeckTitle)).not.toBeInTheDocument()
	})
})
