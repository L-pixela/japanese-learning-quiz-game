/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi } from 'vitest'
import { POST, GET } from './+server'
import { getDb } from '$lib/server/db'
import { mockSelect } from '$lib/server/db/mock-db'

function mockDeckLookupThenCards(deckRows: any[], cards: any[]) {
	const select = vi.fn()
	select.mockReturnValueOnce({
		from: vi.fn().mockReturnValue({
			where: vi.fn().mockReturnValue({
				limit: vi.fn().mockResolvedValue(deckRows),
			}),
		}),
	})
	select.mockReturnValueOnce({
		from: vi.fn().mockReturnValue({
			where: vi.fn().mockResolvedValue(cards),
		}),
	})
	return { select }
}

vi.mock('$lib/server/db', () => ({
	getDb: vi.fn(),
}))

describe('/api/decks/[id]/cards', () => {
	describe('POST', () => {
		it('returns 401 if user is not logged in', async () => {
			const request = {
				json: vi.fn().mockResolvedValue({ front: 'こんにちは', back: 'hello' }),
			} as any
			const locals = {} as any
			const response = await POST({ request, params: { id: 'd1' }, platform: {}, locals } as any)
			const data = await response.json()

			expect(response.status).toBe(401)
			expect(data).toEqual({ error: 'unauthorized' })
		})

		it('returns 400 if front is invalid', async () => {
			const request = { json: vi.fn().mockResolvedValue({ front: '   ', back: 'hello' }) } as any
			const locals = { user: { id: 'u1' } } as any
			const response = await POST({ request, params: { id: 'd1' }, platform: {}, locals } as any)
			const data = await response.json()

			expect(response.status).toBe(400)
			expect(data).toEqual({ error: 'front is required' })
		})

		it('returns 400 if back is invalid', async () => {
			const request = { json: vi.fn().mockResolvedValue({ front: 'こんにちは', back: '' }) } as any
			const locals = { user: { id: 'u1' } } as any
			const response = await POST({ request, params: { id: 'd1' }, platform: {}, locals } as any)
			const data = await response.json()

			expect(response.status).toBe(400)
			expect(data).toEqual({ error: 'back is required' })
		})

		it('returns 404 if deck does not exist', async () => {
			vi.mocked(getDb).mockReturnValue(mockSelect([]) as any)

			const request = {
				json: vi.fn().mockResolvedValue({ front: 'こんにちは', back: 'hello' }),
			} as any
			const locals = { user: { id: 'u1' } } as any
			const platform = { env: { DB: {} } } as any

			const response = await POST({ request, params: { id: 'd1' }, platform, locals } as any)
			const data = await response.json()

			expect(response.status).toBe(404)
			expect(data).toEqual({ error: 'deck not found' })
		})

		it('returns 403 if deck belongs to another user', async () => {
			vi.mocked(getDb).mockReturnValue(
				mockSelect([{ id: 'd1', userId: 'u2', title: 'Deck' }]) as any,
			)

			const request = {
				json: vi.fn().mockResolvedValue({ front: 'こんにちは', back: 'hello' }),
			} as any
			const locals = { user: { id: 'u1' } } as any
			const platform = { env: { DB: {} } } as any

			const response = await POST({ request, params: { id: 'd1' }, platform, locals } as any)
			const data = await response.json()

			expect(response.status).toBe(403)
			expect(data).toEqual({ error: 'not authorized to add cards to this deck' })
		})

		it('returns 201 with created card when request is valid', async () => {
			const newCard = { id: 'c1', deckId: 'd1', front: 'こんにちは', back: 'hello' }
			const mockDb = {
				...mockSelect([{ id: 'd1', userId: 'u1', title: 'Deck' }]),
				insert: vi.fn().mockReturnValue({
					values: vi.fn().mockReturnValue({
						returning: vi.fn().mockResolvedValue([newCard]),
					}),
				}),
			}
			vi.mocked(getDb).mockReturnValue(mockDb as any)

			const request = {
				json: vi.fn().mockResolvedValue({ front: 'こんにちは', back: 'hello' }),
			} as any
			const locals = { user: { id: 'u1' } } as any
			const platform = { env: { DB: {} } } as any

			const response = await POST({ request, params: { id: 'd1' }, platform, locals } as any)
			const data = await response.json()

			expect(response.status).toBe(201)
			expect(data).toEqual({ card: newCard })
		})
	})

	describe('GET', () => {
		it('returns 401 if user is not logged in', async () => {
			const locals = {} as any
			const response = await GET({ params: { id: 'd1' }, platform: {}, locals } as any)
			const data = await response.json()

			expect(response.status).toBe(401)
			expect(data).toEqual({ error: 'unauthorized' })
		})

		it('returns 404 if deck does not exist', async () => {
			vi.mocked(getDb).mockReturnValue(mockSelect([]) as any)

			const locals = { user: { id: 'u1' } } as any
			const platform = { env: { DB: {} } } as any

			const response = await GET({ params: { id: 'd1' }, platform, locals } as any)
			const data = await response.json()

			expect(response.status).toBe(404)
			expect(data).toEqual({ error: 'deck not found' })
		})

		it('returns 403 if deck belongs to another user', async () => {
			vi.mocked(getDb).mockReturnValue(mockSelect([{ id: 'd1', userId: 'u2' }]) as any)

			const locals = { user: { id: 'u1' } } as any
			const platform = { env: { DB: {} } } as any

			const response = await GET({ params: { id: 'd1' }, platform, locals } as any)
			const data = await response.json()

			expect(response.status).toBe(403)
			expect(data).toEqual({ error: 'not authorized to access this deck' })
		})

		it('returns 200 with the deck cards when user owns the deck', async () => {
			const cards = [
				{ id: 'c1', deckId: 'd1', front: 'こんにちは', back: 'hello' },
				{ id: 'c2', deckId: 'd1', front: 'ありがとう', back: 'thank you' },
			]
			const mockDb = mockDeckLookupThenCards([{ id: 'd1', userId: 'u1' }], cards)
			vi.mocked(getDb).mockReturnValue(mockDb as any)

			const locals = { user: { id: 'u1' } } as any
			const platform = { env: { DB: {} } } as any

			const response = await GET({ params: { id: 'd1' }, platform, locals } as any)
			const data = await response.json()

			expect(response.status).toBe(200)
			expect(data).toEqual({ cards })
		})
	})
})
