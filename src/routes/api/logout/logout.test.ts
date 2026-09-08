/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi } from 'vitest'
import { POST } from './+server'
import { getDb } from '$lib/server/db'

vi.mock('$lib/server/db', () => ({
	getDb: vi.fn(),
}))

describe('POST /api/logout', () => {
	it('returns 401 if not logged in', async () => {
		const locals = {} as any
		const cookies = { delete: vi.fn() } as any
		const response = await POST({ locals, cookies, platform: {} } as any)
		const data = await response.json()

		expect(response.status).toBe(401)
		expect(data).toEqual({ error: 'unauthorized' })
	})

	it('deletes session and cookie if logged in', async () => {
		const deleteWhere = vi.fn().mockResolvedValue(undefined)
		const mockDb = {
			delete: vi.fn().mockReturnValue({
				where: deleteWhere,
			}),
		}
		vi.mocked(getDb).mockReturnValue(mockDb as any)

		const locals = { session: { id: 'sess_123' } } as any
		const cookies = { delete: vi.fn() } as any
		const platform = { env: { DB: {} } } as any

		const response = await POST({ locals, cookies, platform } as any)
		const data = await response.json()

		expect(response.status).toBe(200)
		expect(data).toEqual({ success: true })
		expect(cookies.delete).toHaveBeenCalledWith('session', { path: '/' })
		expect(mockDb.delete).toHaveBeenCalled()
	})
})
