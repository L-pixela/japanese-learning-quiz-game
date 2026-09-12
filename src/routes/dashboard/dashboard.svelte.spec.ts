
import { page } from 'vitest/browser'
import { describe, expect, it, vi } from 'vitest'
import { render } from 'vitest-browser-svelte'
import Dashboard from './+page.svelte'
import { MOCK_DECKS } from '$lib/mock-data/decks'

vi.mock('$app/stores', () => ({
  page: {
    subscribe: (fn: (value: { url: URL }) => void) => {
      fn({ url: new URL('http://localhost/dashboard') })
      return () => {}
    },
  },
}))

describe('Dashboard +page.svelte', () => {
  it('renders the rank status card with points and streak', async () => {
    render(Dashboard)

    await expect.element(page.getByText('1,250')).toBeInTheDocument()
    await expect.element(page.getByText('80')).toBeInTheDocument()
  })

  it('renders the decks section heading and create button', async () => {
    render(Dashboard)

    await expect.element(page.getByText('Your decks')).toBeInTheDocument()
    await expect.element(page.getByRole('button', { name: '+ Create new' })).toBeInTheDocument()
  })

  it('renders every mock deck with its title and card count', async () => {
    render(Dashboard)

    for (const deck of MOCK_DECKS) {
      await expect.element(page.getByText(deck.title)).toBeInTheDocument()
      await expect.element(page.getByText(`${deck.cardCount} cards`)).toBeInTheDocument()
    }
  })

  it('renders the new deck creation tile', async () => {
    render(Dashboard)

    await expect
      .element(page.getByRole('button', { name: 'Create new deck' }))
      .toBeInTheDocument()
  })
})