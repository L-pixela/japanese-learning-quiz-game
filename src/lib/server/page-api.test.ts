import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { pageApi } from './page-api'

describe('pageApi', () => {
	beforeEach(() => {
		globalThis.fetch = vi.fn()
	})
	afterEach(() => {
		vi.restoreAllMocks()
	})

	it('redirects to /login on a 401 response', async () => {
		vi.mocked(globalThis.fetch).mockResolvedValue({ status: 401, ok: false } as Response)
		await expect(pageApi(globalThis.fetch, '/api/profile')).rejects.toMatchObject({
			status: 303,
			location: '/login',
		})
	})

	it('throws an HTTP error on a non-ok response', async () => {
		vi.mocked(globalThis.fetch).mockResolvedValue({ status: 500, ok: false } as Response)
		await expect(pageApi(globalThis.fetch, '/api/profile')).rejects.toMatchObject({ status: 500 })
	})

	it('resolves the parsed JSON body on an ok response', async () => {
		vi.mocked(globalThis.fetch).mockResolvedValue({
			status: 200,
			ok: true,
			json: async () => ({ hello: 'world' }),
		} as Response)
		await expect(pageApi(globalThis.fetch, '/api/profile')).resolves.toEqual({ hello: 'world' })
	})
})
