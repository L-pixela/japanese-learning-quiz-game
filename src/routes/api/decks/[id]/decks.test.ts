/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi } from 'vitest'
import { PUT, DELETE } from './+server'
import { getDb } from '$lib/server/db'

vi.mock('$lib/server/db', () => ({
	getDb: vi.fn(),
}))

describe('/api/decks/[id]', () => {
	describe('PUT', () => {
		it('returns 401 if user is not logged in', async () => {
			const request = { json: vi.fn().mockResolvedValue({ title: 'New Title' }) } as any
			const locals = {} as any
			const response = await PUT({ request, params: { id: 'd1' }, platform: {}, locals } as any)
			const data = await response.json()

			expect(response.status).toBe(401)
			expect(data).toEqual({ error: 'unauthorized' })
		})

		it('returns 400 if title is invalid', async () => {
			const request = { json: vi.fn().mockResolvedValue({ title: '   ' }) } as any
			const locals = { user: { id: 'u1' } } as any
			const response = await PUT({ request, params: { id: 'd1' }, platform: {}, locals } as any)
			const data = await response.json()

			expect(response.status).toBe(400)
			expect(data).toEqual({ error: 'title is required' })
		})

		it('returns 404 if deck does not exist', async () => {
			const mockDb = {
				select: vi.fn().mockReturnValue({
					from: vi.fn().mockReturnValue({
						where: vi.fn().mockReturnValue({
							limit: vi.fn().mockResolvedValue([]),
						}),
					}),
				}),
			}
			vi.mocked(getDb).mockReturnValue(mockDb as any)

			const request = { json: vi.fn().mockResolvedValue({ title: 'New Title' }) } as any
			const locals = { user: { id: 'u1' } } as any
			const platform = { env: { DB: {} } } as any

			const response = await PUT({ request, params: { id: 'd1' }, platform, locals } as any)
			const data = await response.json()

			expect(response.status).toBe(404)
			expect(data).toEqual({ error: 'deck not found' })
		})

		it('returns 403 if deck belongs to another user', async () => {
			const mockDb = {
				select: vi.fn().mockReturnValue({
					from: vi.fn().mockReturnValue({
						where: vi.fn().mockReturnValue({
							limit: vi.fn().mockResolvedValue([{ id: 'd1', userId: 'u2', title: 'Old' }]),
						}),
					}),
				}),
			}
			vi.mocked(getDb).mockReturnValue(mockDb as any)

			const request = { json: vi.fn().mockResolvedValue({ title: 'New Title' }) } as any
			const locals = { user: { id: 'u1' } } as any
			const platform = { env: { DB: {} } } as any

			const response = await PUT({ request, params: { id: 'd1' }, platform, locals } as any)
			const data = await response.json()

			expect(response.status).toBe(403)
			expect(data).toEqual({ error: 'not authorized to edit this deck' })
		})

		it('returns 200 with updated deck when request is valid', async () => {
			const updatedDeck = { id: 'd1', userId: 'u1', title: 'New Title' }
			const mockDb = {
				select: vi.fn().mockReturnValue({
					from: vi.fn().mockReturnValue({
						where: vi.fn().mockReturnValue({
							limit: vi.fn().mockResolvedValue([{ id: 'd1', userId: 'u1', title: 'Old' }]),
						}),
					}),
				}),
				update: vi.fn().mockReturnValue({
					set: vi.fn().mockReturnValue({
						where: vi.fn().mockReturnValue({
							returning: vi.fn().mockResolvedValue([updatedDeck]),
						}),
					}),
				}),
			}
			vi.mocked(getDb).mockReturnValue(mockDb as any)

			const request = { json: vi.fn().mockResolvedValue({ title: 'New Title' }) } as any
			const locals = { user: { id: 'u1' } } as any
			const platform = { env: { DB: {} } } as any

			const response = await PUT({ request, params: { id: 'd1' }, platform, locals } as any)
			const data = await response.json()

			expect(response.status).toBe(200)
			expect(data).toEqual({ deck: updatedDeck })
		})
	})

	describe('DELETE', () => {
		it('returns 401 if user is not logged in', async () => {
			const locals = {} as any
			const response = await DELETE({ params: { id: 'd1' }, platform: {}, locals } as any)
			const data = await response.json()

			expect(response.status).toBe(401)
			expect(data).toEqual({ error: 'unauthorized' })
		})

		it('returns 404 if deck does not exist', async () => {
			const mockDb = {
				select: vi.fn().mockReturnValue({
					from: vi.fn().mockReturnValue({
						where: vi.fn().mockReturnValue({
							limit: vi.fn().mockResolvedValue([]),
						}),
					}),
				}),
			}
			vi.mocked(getDb).mockReturnValue(mockDb as any)

			const locals = { user: { id: 'u1' } } as any
			const platform = { env: { DB: {} } } as any

			const response = await DELETE({ params: { id: 'd1' }, platform, locals } as any)
			const data = await response.json()

			expect(response.status).toBe(404)
			expect(data).toEqual({ error: 'deck not found' })
		})

		it('returns 403 if user does not own the deck', async () => {
			const mockDb = {
				select: vi.fn().mockReturnValue({
					from: vi.fn().mockReturnValue({
						where: vi.fn().mockReturnValue({
							limit: vi.fn().mockResolvedValue([{ id: 'd1', userId: 'u2' }]),
						}),
					}),
				}),
			}
			vi.mocked(getDb).mockReturnValue(mockDb as any)

			const locals = { user: { id: 'u1' } } as any
			const platform = { env: { DB: {} } } as any

			const response = await DELETE({ params: { id: 'd1' }, platform, locals } as any)
			const data = await response.json()

			expect(response.status).toBe(403)
			expect(data).toEqual({ error: 'not authorized to delete this deck' })
		})

		it('returns 200 and deletes deck when user owns it', async () => {
			const mockDb = {
				select: vi.fn().mockReturnValue({
					from: vi.fn().mockReturnValue({
						where: vi.fn().mockReturnValue({
							limit: vi.fn().mockResolvedValue([{ id: 'd1', userId: 'u1' }]),
						}),
					}),
				}),
				delete: vi.fn().mockReturnValue({
					where: vi.fn().mockResolvedValue(undefined),
				}),
			}
			vi.mocked(getDb).mockReturnValue(mockDb as any)

			const locals = { user: { id: 'u1' } } as any
			const platform = { env: { DB: {} } } as any

			const response = await DELETE({ params: { id: 'd1' }, platform, locals } as any)
			const data = await response.json()

			expect(response.status).toBe(200)
			expect(data).toEqual({ success: true })
		})
	})
})
