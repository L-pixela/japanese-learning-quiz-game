/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi } from 'vitest'
import { PUT, DELETE } from './+server'
import { getDb } from '$lib/server/db'
import { mockJoinedSelect } from '$lib/server/db/mock-db'

vi.mock('$lib/server/db', () => ({
	getDb: vi.fn(),
}))

describe('/api/cards/[id]', () => {
	describe('PUT', () => {
		it('returns 401 if user is not logged in', async () => {
			const request = {
				json: vi.fn().mockResolvedValue({ front: 'こんにちは', back: 'hello' }),
			} as any
			const locals = {} as any
			const response = await PUT({ request, params: { id: 'c1' }, platform: {}, locals } as any)
			const data = await response.json()

			expect(response.status).toBe(401)
			expect(data).toEqual({ error: 'unauthorized' })
		})

		it('returns 400 if front is invalid', async () => {
			const request = { json: vi.fn().mockResolvedValue({ front: '   ', back: 'hello' }) } as any
			const locals = { user: { id: 'u1' } } as any
			const response = await PUT({ request, params: { id: 'c1' }, platform: {}, locals } as any)
			const data = await response.json()

			expect(response.status).toBe(400)
			expect(data).toEqual({ error: 'front is required' })
		})

		it('returns 400 if back is invalid', async () => {
			const request = { json: vi.fn().mockResolvedValue({ front: 'こんにちは', back: '' }) } as any
			const locals = { user: { id: 'u1' } } as any
			const response = await PUT({ request, params: { id: 'c1' }, platform: {}, locals } as any)
			const data = await response.json()

			expect(response.status).toBe(400)
			expect(data).toEqual({ error: 'back is required' })
		})

		it('returns 404 if card does not exist', async () => {
			vi.mocked(getDb).mockReturnValue(mockJoinedSelect([]) as any)

			const request = {
				json: vi.fn().mockResolvedValue({ front: 'こんにちは', back: 'hello' }),
			} as any
			const locals = { user: { id: 'u1' } } as any
			const platform = { env: { DB: {} } } as any

			const response = await PUT({ request, params: { id: 'c1' }, platform, locals } as any)
			const data = await response.json()

			expect(response.status).toBe(404)
			expect(data).toEqual({ error: 'card not found' })
		})

		it('returns 403 if card belongs to a deck owned by another user', async () => {
			vi.mocked(getDb).mockReturnValue(
				mockJoinedSelect([
					{ id: 'c1', deckId: 'd1', front: 'old', back: 'old', deckUserId: 'u2' },
				]) as any,
			)

			const request = {
				json: vi.fn().mockResolvedValue({ front: 'こんにちは', back: 'hello' }),
			} as any
			const locals = { user: { id: 'u1' } } as any
			const platform = { env: { DB: {} } } as any

			const response = await PUT({ request, params: { id: 'c1' }, platform, locals } as any)
			const data = await response.json()

			expect(response.status).toBe(403)
			expect(data).toEqual({ error: 'not authorized to edit this card' })
		})

		it('returns 200 with updated card when request is valid', async () => {
			const updatedCard = { id: 'c1', deckId: 'd1', front: 'こんにちは', back: 'hello' }
			const mockDb = {
				...mockJoinedSelect([
					{ id: 'c1', deckId: 'd1', front: 'old', back: 'old', deckUserId: 'u1' },
				]),
				update: vi.fn().mockReturnValue({
					set: vi.fn().mockReturnValue({
						where: vi.fn().mockReturnValue({
							returning: vi.fn().mockResolvedValue([updatedCard]),
						}),
					}),
				}),
			}
			vi.mocked(getDb).mockReturnValue(mockDb as any)

			const request = {
				json: vi.fn().mockResolvedValue({ front: 'こんにちは', back: 'hello' }),
			} as any
			const locals = { user: { id: 'u1' } } as any
			const platform = { env: { DB: {} } } as any

			const response = await PUT({ request, params: { id: 'c1' }, platform, locals } as any)
			const data = await response.json()

			expect(response.status).toBe(200)
			expect(data).toEqual({ card: updatedCard })
		})
	})

	describe('DELETE', () => {
		it('returns 401 if user is not logged in', async () => {
			const locals = {} as any
			const response = await DELETE({ params: { id: 'c1' }, platform: {}, locals } as any)
			const data = await response.json()

			expect(response.status).toBe(401)
			expect(data).toEqual({ error: 'unauthorized' })
		})

		it('returns 404 if card does not exist', async () => {
			vi.mocked(getDb).mockReturnValue(mockJoinedSelect([]) as any)

			const locals = { user: { id: 'u1' } } as any
			const platform = { env: { DB: {} } } as any

			const response = await DELETE({ params: { id: 'c1' }, platform, locals } as any)
			const data = await response.json()

			expect(response.status).toBe(404)
			expect(data).toEqual({ error: 'card not found' })
		})

		it('returns 403 if card belongs to a deck owned by another user', async () => {
			vi.mocked(getDb).mockReturnValue(
				mockJoinedSelect([
					{ id: 'c1', deckId: 'd1', front: 'old', back: 'old', deckUserId: 'u2' },
				]) as any,
			)

			const locals = { user: { id: 'u1' } } as any
			const platform = { env: { DB: {} } } as any

			const response = await DELETE({ params: { id: 'c1' }, platform, locals } as any)
			const data = await response.json()

			expect(response.status).toBe(403)
			expect(data).toEqual({ error: 'not authorized to delete this card' })
		})

		it('returns 200 and deletes card when user owns the parent deck', async () => {
			const mockDb = {
				...mockJoinedSelect([
					{ id: 'c1', deckId: 'd1', front: 'old', back: 'old', deckUserId: 'u1' },
				]),
				delete: vi.fn().mockReturnValue({
					where: vi.fn().mockResolvedValue(undefined),
				}),
			}
			vi.mocked(getDb).mockReturnValue(mockDb as any)

			const locals = { user: { id: 'u1' } } as any
			const platform = { env: { DB: {} } } as any

			const response = await DELETE({ params: { id: 'c1' }, platform, locals } as any)
			const data = await response.json()

			expect(response.status).toBe(200)
			expect(data).toEqual({ success: true })
		})
	})
})
