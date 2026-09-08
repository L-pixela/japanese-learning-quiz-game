/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { POST } from './+server'
import { getDb } from '$lib/server/db'

vi.mock('$lib/server/db', () => ({
	getDb: vi.fn(),
}))

function mockDbFor(existingUser: any, updatedUser: any) {
	return {
		select: vi.fn().mockReturnValue({
			from: vi.fn().mockReturnValue({
				where: vi.fn().mockReturnValue({
					limit: vi.fn().mockResolvedValue(existingUser ? [existingUser] : []),
				}),
			}),
		}),
		update: vi.fn().mockReturnValue({
			set: vi.fn().mockReturnValue({
				where: vi.fn().mockReturnValue({
					returning: vi.fn().mockResolvedValue([updatedUser]),
				}),
			}),
		}),
	}
}

describe('POST /api/quiz/submit', () => {
	beforeEach(() => {
		vi.useFakeTimers()
		vi.setSystemTime(new Date('2024-01-15T10:00:00.000Z'))
	})

	afterEach(() => {
		vi.useRealTimers()
	})

	it('returns 400 if required fields are missing or the wrong type', async () => {
		const request = {
			json: vi.fn().mockResolvedValue({ userId: 'user_1' }),
		} as any

		const response = await POST({ request } as any)
		const data = await response.json()

		expect(response.status).toBe(400)
		expect(data).toEqual({ error: 'userId, correctCount, and totalCount are required' })
	})

	it('returns 400 if correctCount/totalCount values are invalid', async () => {
		const request = {
			json: vi.fn().mockResolvedValue({ userId: 'user_1', correctCount: 5, totalCount: 3 }),
		} as any

		const response = await POST({ request } as any)
		const data = await response.json()

		expect(response.status).toBe(400)
		expect(data).toEqual({ error: 'invalid correctCount/totalCount values' })
	})

	it('returns 404 if the user does not exist', async () => {
		const mockDb = mockDbFor(null, null)
		vi.mocked(getDb).mockReturnValue(mockDb as any)

		const request = {
			json: vi.fn().mockResolvedValue({ userId: 'missing', correctCount: 2, totalCount: 5 }),
		} as any
		const platform = { env: { DB: {} } } as any

		const response = await POST({ request, platform } as any)
		const data = await response.json()

		expect(response.status).toBe(404)
		expect(data).toEqual({ error: 'user not found' })
	})

	it('starts a streak of 1 on a user’s first quiz', async () => {
		const existingUser = {
			id: 'user_1',
			username: 'testuser',
			points: 0,
			streak: 0,
			lastQuizAt: null,
			rank: 'shiragohan',
		}
		const updatedUser = { ...existingUser, points: 30, streak: 1 }
		const mockDb = mockDbFor(existingUser, updatedUser)
		vi.mocked(getDb).mockReturnValue(mockDb as any)

		const request = {
			json: vi.fn().mockResolvedValue({ userId: 'user_1', correctCount: 3, totalCount: 5 }),
		} as any
		const platform = { env: { DB: {} } } as any

		const response = await POST({ request, platform } as any)
		const data = (await response.json()) as { pointsEarned: number }

		expect(response.status).toBe(200)
		expect(data.pointsEarned).toBe(30)
		expect(mockDb.update().set).toHaveBeenCalledWith(
			expect.objectContaining({ streak: 1, rank: 'shiragohan' }),
		)
	})

	it('keeps the same streak when quizzing again on the same day', async () => {
		const existingUser = {
			id: 'user_1',
			username: 'testuser',
			points: 10,
			streak: 4,
			lastQuizAt: new Date('2024-01-15T08:00:00.000Z'),
			rank: 'umeboshi',
		}
		const updatedUser = { ...existingUser }
		const mockDb = mockDbFor(existingUser, updatedUser)
		vi.mocked(getDb).mockReturnValue(mockDb as any)

		const request = {
			json: vi.fn().mockResolvedValue({ userId: 'user_1', correctCount: 1, totalCount: 1 }),
		} as any
		const platform = { env: { DB: {} } } as any

		await POST({ request, platform } as any)

		expect(mockDb.update().set).toHaveBeenCalledWith(expect.objectContaining({ streak: 4 }))
	})

	it('increments the streak and updates the rank on a consecutive day', async () => {
		const existingUser = {
			id: 'user_1',
			username: 'testuser',
			points: 10,
			streak: 6,
			lastQuizAt: new Date('2024-01-14T09:00:00.000Z'),
			rank: 'umeboshi',
		}
		const updatedUser = { ...existingUser, streak: 7, rank: 'mentaiko' }
		const mockDb = mockDbFor(existingUser, updatedUser)
		vi.mocked(getDb).mockReturnValue(mockDb as any)

		const request = {
			json: vi.fn().mockResolvedValue({ userId: 'user_1', correctCount: 1, totalCount: 1 }),
		} as any
		const platform = { env: { DB: {} } } as any

		await POST({ request, platform } as any)

		expect(mockDb.update().set).toHaveBeenCalledWith(
			expect.objectContaining({ streak: 7, rank: 'mentaiko' }),
		)
	})

	it('resets the streak to 1 after missing a day', async () => {
		const existingUser = {
			id: 'user_1',
			username: 'testuser',
			points: 10,
			streak: 8,
			lastQuizAt: new Date('2024-01-10T09:00:00.000Z'),
			rank: 'mentaiko',
		}
		const updatedUser = { ...existingUser, streak: 1, rank: 'shiragohan' }
		const mockDb = mockDbFor(existingUser, updatedUser)
		vi.mocked(getDb).mockReturnValue(mockDb as any)

		const request = {
			json: vi.fn().mockResolvedValue({ userId: 'user_1', correctCount: 1, totalCount: 1 }),
		} as any
		const platform = { env: { DB: {} } } as any

		await POST({ request, platform } as any)

		expect(mockDb.update().set).toHaveBeenCalledWith(
			expect.objectContaining({ streak: 1, rank: 'shiragohan' }),
		)
	})
})
