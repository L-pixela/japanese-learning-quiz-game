import { beforeEach, describe, expect, it, vi } from 'vitest'
import { load } from './+page.server'
import { getQuizResult } from '$lib/server/level-quiz'
import type { PageServerLoadEvent } from './$types'

vi.mock('$lib/server/level-quiz', () => ({
	getQuizResult: vi.fn(),
}))

const event = (attempt: string | null, user = true) =>
	({
		locals: { user: user ? { id: 'u1' } : null },
		platform: { env: { DB: {} } },
		url: { searchParams: new URLSearchParams(attempt ? { attempt } : {}) },
	}) as unknown as PageServerLoadEvent

describe('quiz-results load', () => {
	beforeEach(() => {
		vi.mocked(getQuizResult).mockReset()
	})

	it('redirects to /login when signed out', async () => {
		expect.assertions(1)
		try {
			await load(event(null, false))
		} catch (thrown) {
			expect(thrown).toMatchObject({ status: 303, location: '/login' })
		}
	})

	it('returns a null result when there is no attempt query param', async () => {
		expect(await load(event(null))).toEqual({ result: null })
		expect(getQuizResult).not.toHaveBeenCalled()
	})

	it('404s when the attempt cannot be found', async () => {
		vi.mocked(getQuizResult).mockResolvedValue(null)
		expect.assertions(1)
		try {
			await load(event('a1'))
		} catch (thrown) {
			expect(thrown).toMatchObject({ status: 404 })
		}
	})

	it('returns the quiz result for a valid attempt', async () => {
		const result = { attemptId: 'a1', level: 1, score: 8 }
		vi.mocked(getQuizResult).mockResolvedValue(
			result as unknown as Awaited<ReturnType<typeof getQuizResult>>,
		)
		expect(await load(event('a1'))).toEqual({ result })
	})
})
