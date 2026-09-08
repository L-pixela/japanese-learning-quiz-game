/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi } from 'vitest'
import { handle } from './hooks.server'
import { getDb } from '$lib/server/db'

vi.mock('$lib/server/db', () => ({
	getDb: vi.fn(),
}))

describe('Server Hooks (handle)', () => {
	it('sets user and session to null when no session cookie exists', async () => {
		const event: any = {
			cookies: { get: vi.fn().mockReturnValue(undefined) },
			locals: {},
		}
		const resolve = vi.fn().mockResolvedValue('resolved_response')

		const result = await handle({ event, resolve })

		expect(event.locals.user).toBeNull()
		expect(event.locals.session).toBeNull()
		expect(resolve).toHaveBeenCalledWith(event)
		expect(result).toBe('resolved_response')
	})

	it('deletes cookie when session is not found in database', async () => {
		const mockDb = {
			select: vi.fn().mockReturnValue({
				from: vi.fn().mockReturnValue({
					innerJoin: vi.fn().mockReturnValue({
						where: vi.fn().mockReturnValue({
							limit: vi.fn().mockResolvedValue([]),
						}),
					}),
				}),
			}),
		}
		vi.mocked(getDb).mockReturnValue(mockDb as any)

		const event: any = {
			cookies: {
				get: vi.fn().mockReturnValue('invalid_sess_id'),
				delete: vi.fn(),
			},
			locals: {},
			platform: { env: { DB: {} } },
		}
		const resolve = vi.fn().mockResolvedValue('resolved_response')

		await handle({ event, resolve })

		expect(event.cookies.delete).toHaveBeenCalledWith('session', { path: '/' })
		expect(event.locals.user).toBeNull()
		expect(event.locals.session).toBeNull()
	})

	it('deletes expired session and cookie', async () => {
		const pastDate = new Date(Date.now() - 10000)
		const mockDb = {
			select: vi.fn().mockReturnValue({
				from: vi.fn().mockReturnValue({
					innerJoin: vi.fn().mockReturnValue({
						where: vi.fn().mockReturnValue({
							limit: vi.fn().mockResolvedValue([
								{
									session: { id: 'sess_expired', expiresAt: pastDate },
									user: { id: 'user_1', username: 'testuser' },
								},
							]),
						}),
					}),
				}),
			}),
			delete: vi.fn().mockReturnValue({
				where: vi.fn().mockResolvedValue(undefined),
			}),
		}
		vi.mocked(getDb).mockReturnValue(mockDb as any)

		const event: any = {
			cookies: {
				get: vi.fn().mockReturnValue('sess_expired'),
				delete: vi.fn(),
			},
			locals: {},
			platform: { env: { DB: {} } },
		}
		const resolve = vi.fn().mockResolvedValue('resolved_response')

		await handle({ event, resolve })

		expect(mockDb.delete).toHaveBeenCalled()
		expect(event.cookies.delete).toHaveBeenCalledWith('session', { path: '/' })
		expect(event.locals.user).toBeNull()
	})

	it('populates event.locals with user and session for valid session', async () => {
		const futureDate = new Date(Date.now() + 100000)
		const mockSession = { id: 'sess_valid', expiresAt: futureDate }
		const mockUser = { id: 'user_1', username: 'testuser' }

		const mockDb = {
			select: vi.fn().mockReturnValue({
				from: vi.fn().mockReturnValue({
					innerJoin: vi.fn().mockReturnValue({
						where: vi.fn().mockReturnValue({
							limit: vi.fn().mockResolvedValue([
								{
									session: mockSession,
									user: mockUser,
								},
							]),
						}),
					}),
				}),
			}),
		}
		vi.mocked(getDb).mockReturnValue(mockDb as any)

		const event: any = {
			cookies: {
				get: vi.fn().mockReturnValue('sess_valid'),
			},
			locals: {},
			platform: { env: { DB: {} } },
		}
		const resolve = vi.fn().mockResolvedValue('resolved_response')

		await handle({ event, resolve })

		expect(event.locals.user).toEqual(mockUser)
		expect(event.locals.session).toEqual(mockSession)
		expect(resolve).toHaveBeenCalledWith(event)
	})
})
