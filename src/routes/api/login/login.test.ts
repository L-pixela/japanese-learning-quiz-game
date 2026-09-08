/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi } from 'vitest'
import { POST } from './+server'
import { getDb } from '$lib/server/db'
import { scryptSync } from 'node:crypto'

vi.mock('$lib/server/db', () => ({
	getDb: vi.fn(),
}))

describe('POST /api/login', () => {
	it('returns 400 if username or password is missing', async () => {
		const request = {
			json: vi.fn().mockResolvedValue({ username: '' }),
		} as any

		const response = await POST({ request } as any)
		const data = await response.json()

		expect(response.status).toBe(400)
		expect(data).toEqual({ error: 'username and password are required' })
	})

	it('returns 401 if user is not found in database', async () => {
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

		const request = {
			json: vi.fn().mockResolvedValue({ username: 'unknown', password: 'password123' }),
		} as any
		const platform = { env: { DB: {} } } as any

		const response = await POST({ request, platform } as any)
		const data = await response.json()

		expect(response.status).toBe(401)
		expect(data).toEqual({ error: 'invalid credentials' })
	})

	it('returns 401 if password is invalid', async () => {
		const salt = 'randomsalt'
		const wrongKey = 'wrongkey'
		const mockUser = {
			id: 'user_1',
			username: 'testuser',
			passwordHash: `${salt}:${wrongKey}`,
		}

		const mockDb = {
			select: vi.fn().mockReturnValue({
				from: vi.fn().mockReturnValue({
					where: vi.fn().mockReturnValue({
						limit: vi.fn().mockResolvedValue([mockUser]),
					}),
				}),
			}),
		}
		vi.mocked(getDb).mockReturnValue(mockDb as any)

		const request = {
			json: vi.fn().mockResolvedValue({ username: 'testuser', password: 'wrongpassword' }),
		} as any
		const platform = { env: { DB: {} } } as any

		const response = await POST({ request, platform } as any)
		const data = await response.json()

		expect(response.status).toBe(401)
		expect(data).toEqual({ error: 'invalid credentials' })
	})

	it('returns 200 and sets cookie when credentials are valid', async () => {
		const salt = '1234567890abcdef'
		const password = 'mysecretpassword'
		const key = scryptSync(password, salt, 64).toString('hex')
		const passwordHash = `${salt}:${key}`

		const mockUser = {
			id: 'user_1',
			username: 'testuser',
			passwordHash,
		}

		const mockDb = {
			select: vi.fn().mockReturnValue({
				from: vi.fn().mockReturnValue({
					where: vi.fn().mockReturnValue({
						limit: vi.fn().mockResolvedValue([mockUser]),
					}),
				}),
			}),
			insert: vi.fn().mockReturnValue({
				values: vi.fn().mockResolvedValue(undefined),
			}),
		}
		vi.mocked(getDb).mockReturnValue(mockDb as any)

		const request = {
			json: vi.fn().mockResolvedValue({ username: 'testuser', password }),
		} as any
		const cookies = { set: vi.fn() } as any
		const platform = { env: { DB: {} } } as any

		const response = await POST({ request, platform, cookies } as any)
		const data = await response.json()

		expect(response.status).toBe(200)
		expect(data).toEqual({ user: { id: 'user_1', username: 'testuser' } })
		expect(cookies.set).toHaveBeenCalled()
	})
})
