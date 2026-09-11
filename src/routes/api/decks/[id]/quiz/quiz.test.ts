/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi } from 'vitest'
import { DEFAULT_QUIZ_SIZE, MAX_QUIZ_SIZE, GET } from './+server'
import { getDb } from '$lib/server/db'
import { mockSelect, mockSelectSequence } from '$lib/server/db/mock-db'

vi.mock('$lib/server/db', () => ({
	getDb: vi.fn(),
}))

function mockUrl(params: Record<string, string> = {}) {
	return { searchParams: new URLSearchParams(params) } as any
}

describe('/api/decks/[id]/quiz', () => {
	describe('GET', () => {
		it('returns 401 if user is not logged in', async () => {
			const locals = {} as any
			const response = await GET({
				params: { id: 'd1' },
				url: mockUrl(),
				platform: {},
				locals,
			} as any)
			const data = await response.json()

			expect(response.status).toBe(401)
			expect(data).toEqual({ error: 'unauthorized' })
		})

		it('returns 404 if deck does not exist', async () => {
			vi.mocked(getDb).mockReturnValue(mockSelect([]) as any)

			const locals = { user: { id: 'u1' } } as any
			const platform = { env: { DB: {} } } as any

			const response = await GET({
				params: { id: 'd1' },
				url: mockUrl(),
				platform,
				locals,
			} as any)
			const data = await response.json()

			expect(response.status).toBe(404)
			expect(data).toEqual({ error: 'deck not found' })
		})

		it('returns 403 if deck belongs to another user', async () => {
			vi.mocked(getDb).mockReturnValue(mockSelect([{ id: 'd1', userId: 'u2' }]) as any)

			const locals = { user: { id: 'u1' } } as any
			const platform = { env: { DB: {} } } as any

			const response = await GET({
				params: { id: 'd1' },
				url: mockUrl(),
				platform,
				locals,
			} as any)
			const data = await response.json()

			expect(response.status).toBe(403)
			expect(data).toEqual({ error: 'not authorized to access this deck' })
		})

		it('returns 400 if count is not a positive integer', async () => {
			vi.mocked(getDb).mockReturnValue(mockSelect([{ id: 'd1', userId: 'u1' }]) as any)

			const locals = { user: { id: 'u1' } } as any
			const platform = { env: { DB: {} } } as any

			const response = await GET({
				params: { id: 'd1' },
				url: mockUrl({ count: '-5' }),
				platform,
				locals,
			} as any)
			const data = await response.json()

			expect(response.status).toBe(400)
			expect(data).toEqual({ error: 'count must be a positive integer' })
		})

		it(`returns 400 if count is greater than ${MAX_QUIZ_SIZE}`, async () => {
			vi.mocked(getDb).mockReturnValue(mockSelect([{ id: 'd1', userId: 'u1' }]) as any)

			const locals = { user: { id: 'u1' } } as any
			const platform = { env: { DB: {} } } as any

			const response = await GET({
				params: { id: 'd1' },
				url: mockUrl({ count: String(MAX_QUIZ_SIZE + 1) }),
				platform,
				locals,
			} as any)
			const data = await response.json()

			expect(response.status).toBe(400)
			expect(data).toEqual({ error: `count must be at most ${MAX_QUIZ_SIZE}` })
		})

		it('returns 400 if deck has no cards', async () => {
			vi.mocked(getDb).mockReturnValue(
				mockSelectSequence([
					{ rows: [{ id: 'd1', userId: 'u1' }] },
					{ rows: [], ordered: true },
				]) as any,
			)

			const locals = { user: { id: 'u1' } } as any
			const platform = { env: { DB: {} } } as any

			const response = await GET({
				params: { id: 'd1' },
				url: mockUrl(),
				platform,
				locals,
			} as any)
			const data = await response.json()

			expect(response.status).toBe(400)
			expect(data).toEqual({ error: 'deck has no cards to quiz' })
		})

		it('returns 200 with questions, using default count when none provided', async () => {
			const questions = [
				{ id: 'c1', front: 'こんにちは' },
				{ id: 'c2', front: 'ありがとう' },
			]
			const mockDb = mockSelectSequence([
				{ rows: [{ id: 'd1', userId: 'u1' }] },
				{ rows: questions, ordered: true },
			])
			vi.mocked(getDb).mockReturnValue(mockDb as any)

			const locals = { user: { id: 'u1' } } as any
			const platform = { env: { DB: {} } } as any

			const response = await GET({
				params: { id: 'd1' },
				url: mockUrl(),
				platform,
				locals,
			} as any)
			const data = await response.json()

			expect(response.status).toBe(200)
			expect(data).toEqual({ questions })
			expect(mockDb.limits[1]).toHaveBeenCalledWith(DEFAULT_QUIZ_SIZE)
		})

		it('respects a valid custom count param', async () => {
			const mockDb = mockSelectSequence([
				{ rows: [{ id: 'd1', userId: 'u1' }] },
				{ rows: [{ id: 'c1', front: 'こんにちは' }], ordered: true },
			])
			vi.mocked(getDb).mockReturnValue(mockDb as any)

			const locals = { user: { id: 'u1' } } as any
			const platform = { env: { DB: {} } } as any

			const response = await GET({
				params: { id: 'd1' },
				url: mockUrl({ count: '3' }),
				platform,
				locals,
			} as any)

			expect(response.status).toBe(200)
			expect(mockDb.limits[1]).toHaveBeenCalledWith(3)
		})
	})
})
