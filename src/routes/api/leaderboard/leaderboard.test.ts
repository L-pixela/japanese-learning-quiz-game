/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi } from 'vitest'
import { GET } from './+server'
import { getDb } from '$lib/server/db'
import { MAX_LEADERBOARD_PAGE_SIZE } from '$lib/server/leaderboard'

vi.mock('$lib/server/db', () => ({
	getDb: vi.fn(),
}))

function mockOrderedDb(rows: any[]) {
	const offset = vi.fn().mockResolvedValue(rows)
	const limit = vi.fn().mockReturnValue({ offset })
	const orderBy = vi.fn().mockReturnValue({ limit })
	const from = vi.fn().mockReturnValue({ orderBy })
	const select = vi.fn().mockReturnValue({ from })
	return { select, from, orderBy, limit, offset }
}

function makeUrl(query: string) {
	return new URL(`http://localhost/api/leaderboard${query}`)
}

describe('/api/leaderboard', () => {
	describe('GET', () => {
		it('returns 401 if user is not logged in', async () => {
			const locals = {} as any
			const response = await GET({ url: makeUrl(''), platform: {}, locals } as any)
			const data = await response.json()

			expect(response.status).toBe(401)
			expect(data).toEqual({ error: 'unauthorized' })
		})

		it('returns page 1 with default page size and computed positions', async () => {
			const rows = [
				{ id: 'u1', username: 'alice', points: 100, streak: 5, rank: 'mentaiko' },
				{ id: 'u2', username: 'bob', points: 90, streak: 8, rank: 'mentaiko' },
			]
			const mockDb = mockOrderedDb(rows)
			vi.mocked(getDb).mockReturnValue(mockDb as any)

			const locals = { user: { id: 'me' } } as any
			const platform = { env: { DB: {} } } as any

			const response = await GET({ url: makeUrl(''), platform, locals } as any)
			const data = await response.json()

			expect(response.status).toBe(200)
			expect(data).toEqual({
				leaderboard: [
					{ position: 1, ...rows[0] },
					{ position: 2, ...rows[1] },
				],
				page: 1,
				pageSize: 20,
			})
			expect(mockDb.limit).toHaveBeenCalledWith(20)
			expect(mockDb.offset).toHaveBeenCalledWith(0)
		})

		it('applies page and pageSize to limit/offset and position', async () => {
			const rows = [{ id: 'u11', username: 'carol', points: 50, streak: 2, rank: 'shiragohan' }]
			const mockDb = mockOrderedDb(rows)
			vi.mocked(getDb).mockReturnValue(mockDb as any)

			const locals = { user: { id: 'me' } } as any
			const platform = { env: { DB: {} } } as any

			const response = await GET({
				url: makeUrl('?page=2&pageSize=10'),
				platform,
				locals,
			} as any)
			const data = await response.json()

			expect(response.status).toBe(200)
			expect(data).toEqual({
				leaderboard: [{ position: 11, ...rows[0] }],
				page: 2,
				pageSize: 10,
			})
			expect(mockDb.limit).toHaveBeenCalledWith(10)
			expect(mockDb.offset).toHaveBeenCalledWith(10)
		})

		it.each(['0', '-1', '1.5', 'abc'])('returns 400 for invalid page=%s', async (page) => {
			const locals = { user: { id: 'me' } } as any
			const response = await GET({ url: makeUrl(`?page=${page}`), platform: {}, locals } as any)
			const data = await response.json()

			expect(response.status).toBe(400)
			expect(data).toEqual({ error: 'page must be a positive integer' })
		})

		it.each(['0', '-1', '1.5', 'abc'])('returns 400 for invalid pageSize=%s', async (pageSize) => {
			const locals = { user: { id: 'me' } } as any
			const response = await GET({
				url: makeUrl(`?pageSize=${pageSize}`),
				platform: {},
				locals,
			} as any)
			const data = await response.json()

			expect(response.status).toBe(400)
			expect(data).toEqual({ error: 'pageSize must be a positive integer' })
		})

		it('returns 400 when pageSize exceeds the max', async () => {
			const locals = { user: { id: 'me' } } as any
			const response = await GET({
				url: makeUrl(`?pageSize=${MAX_LEADERBOARD_PAGE_SIZE + 1}`),
				platform: {},
				locals,
			} as any)
			const data = await response.json()

			expect(response.status).toBe(400)
			expect(data).toEqual({ error: `pageSize must be at most ${MAX_LEADERBOARD_PAGE_SIZE}` })
		})
	})
})
