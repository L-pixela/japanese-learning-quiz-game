/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi } from 'vitest'
import { POST, GET } from './+server'
import { getDb } from '$lib/server/db'

vi.mock('$lib/server/db', () => ({
	getDb: vi.fn(),
}))

describe('/api/decks', () => {
	describe('POST', () => {
		it('returns 401 if user is not logged in', async () => {
			const request = { json: vi.fn().mockResolvedValue({ title: 'New Deck' }) } as any
			const locals = {} as any
			const response = await POST({ request, platform: {}, locals } as any)
			const data = await response.json()

			expect(response.status).toBe(401)
			expect(data).toEqual({ error: 'unauthorized' })
		})

		it('returns 400 if title is missing', async () => {
			const request = { json: vi.fn().mockResolvedValue({}) } as any
			const locals = { user: { id: 'u1' } } as any
			const response = await POST({ request, platform: {}, locals } as any)
			const data = await response.json()

			expect(response.status).toBe(400)
			expect(data).toEqual({ error: 'title is required' })
		})

		it('returns 400 if title is whitespace only', async () => {
			const request = { json: vi.fn().mockResolvedValue({ title: '   ' }) } as any
			const locals = { user: { id: 'u1' } } as any
			const response = await POST({ request, platform: {}, locals } as any)
			const data = await response.json()

			expect(response.status).toBe(400)
			expect(data).toEqual({ error: 'title is required' })
		})

		it('returns 201 with created deck when request is valid', async () => {
			const createdDeck = { id: 'd1', userId: 'u1', title: 'New Deck' }
			const mockDb = {
				insert: vi.fn().mockReturnValue({
					values: vi.fn().mockReturnValue({
						returning: vi.fn().mockResolvedValue([createdDeck]),
					}),
				}),
			}
			vi.mocked(getDb).mockReturnValue(mockDb as any)

			const request = { json: vi.fn().mockResolvedValue({ title: 'New Deck' }) } as any
			const locals = { user: { id: 'u1' } } as any
			const platform = { env: { DB: {} } } as any

			const response = await POST({ request, platform, locals } as any)
			const data = await response.json()

			expect(response.status).toBe(201)
			expect(data).toEqual({ deck: createdDeck })
		})

		it('trims title before saving', async () => {
			const createdDeck = { id: 'd1', userId: 'u1', title: 'Trimmed' }
			const valuesMock = vi.fn().mockReturnValue({
				returning: vi.fn().mockResolvedValue([createdDeck]),
			})
			const mockDb = {
				insert: vi.fn().mockReturnValue({ values: valuesMock }),
			}
			vi.mocked(getDb).mockReturnValue(mockDb as any)

			const request = { json: vi.fn().mockResolvedValue({ title: '  Trimmed  ' }) } as any
			const locals = { user: { id: 'u1' } } as any
			const platform = { env: { DB: {} } } as any

			await POST({ request, platform, locals } as any)

			expect(valuesMock).toHaveBeenCalledWith(expect.objectContaining({ title: 'Trimmed' }))
		})
	})

	describe('GET', () => {
		it('returns 401 if user is not logged in', async () => {
			const locals = {} as any
			const response = await GET({ platform: {}, locals } as any)
			const data = await response.json()

			expect(response.status).toBe(401)
			expect(data).toEqual({ error: 'unauthorized' })
		})

		it('returns 200 with the list of decks for the current user', async () => {
			const decks = [
				{ id: 'd1', userId: 'u1', title: 'Deck 1' },
				{ id: 'd2', userId: 'u1', title: 'Deck 2' },
			]
			const mockDb = {
				select: vi.fn().mockReturnValue({
					from: vi.fn().mockReturnValue({
						where: vi.fn().mockResolvedValue(decks),
					}),
				}),
			}
			vi.mocked(getDb).mockReturnValue(mockDb as any)

			const locals = { user: { id: 'u1' } } as any
			const platform = { env: { DB: {} } } as any

			const response = await GET({ platform, locals } as any)
			const data = await response.json()

			expect(response.status).toBe(200)
			expect(data).toEqual({ decks })
		})
	})
})
