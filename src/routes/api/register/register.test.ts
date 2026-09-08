/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi } from 'vitest'
import { POST } from './+server'
import { getDb } from '$lib/server/db'

vi.mock('$lib/server/db', () => ({
	getDb: vi.fn(),
}))

describe('POST /api/register', () => {
	it('returns 400 if username or password is missing', async () => {
		const request = {
			json: vi.fn().mockResolvedValue({ username: '' }),
		} as any

		const response = await POST({ request } as any)
		const data = await response.json()

		expect(response.status).toBe(400)
		expect(data).toEqual({ error: 'username and password are required' })
	})

	it('returns 400 if username is too short', async () => {
		const request = {
			json: vi.fn().mockResolvedValue({ username: 'ab', password: 'password123' }),
		} as any

		const response = await POST({ request } as any)
		const data = await response.json()

		expect(response.status).toBe(400)
		expect(data).toEqual({ error: 'username must be at least 3 characters' })
	})

	it('returns 400 if password is too short', async () => {
		const request = {
			json: vi.fn().mockResolvedValue({ username: 'validuser', password: 'short' }),
		} as any

		const response = await POST({ request } as any)
		const data = await response.json()

		expect(response.status).toBe(400)
		expect(data).toEqual({ error: 'password must be at least 8 characters' })
	})

	it('returns 409 if username is already taken', async () => {
		const mockDb = {
			select: vi.fn().mockReturnValue({
				from: vi.fn().mockReturnValue({
					where: vi.fn().mockReturnValue({
						limit: vi.fn().mockResolvedValue([{ id: 'user_1', username: 'testuser' }]),
					}),
				}),
			}),
		}
		vi.mocked(getDb).mockReturnValue(mockDb as any)

		const request = {
			json: vi.fn().mockResolvedValue({ username: 'testuser', password: 'password123' }),
		} as any
		const platform = { env: { DB: {} } } as any

		const response = await POST({ request, platform } as any)
		const data = await response.json()

		expect(response.status).toBe(409)
		expect(data).toEqual({ error: 'username already taken' })
	})

	it('returns 201 and the created user when registration succeeds', async () => {
		const mockDb = {
			select: vi.fn().mockReturnValue({
				from: vi.fn().mockReturnValue({
					where: vi.fn().mockReturnValue({
						limit: vi.fn().mockResolvedValue([]),
					}),
				}),
			}),
			insert: vi.fn().mockReturnValue({
				values: vi.fn().mockReturnValue({
					returning: vi.fn().mockResolvedValue([{ id: 'user_1', username: 'testuser' }]),
				}),
			}),
		}
		vi.mocked(getDb).mockReturnValue(mockDb as any)

		const request = {
			json: vi.fn().mockResolvedValue({ username: 'testuser', password: 'password123' }),
		} as any
		const platform = { env: { DB: {} } } as any

		const response = await POST({ request, platform } as any)
		const data = await response.json()

		expect(response.status).toBe(201)
		expect(data).toEqual({ user: { id: 'user_1', username: 'testuser' } })
		expect(mockDb.insert).toHaveBeenCalled()
	})
})
