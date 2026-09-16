import { describe, expect, it, vi } from 'vitest'
import { load } from './+page.server'
import { LEVELS } from '$lib/levels'
import type { PageServerLoadEvent } from './$types'

const progressBody = {
	levels: LEVELS.map((level) => ({
		...level,
		status: 'not_started',
		bestScore: 0,
		attempts: 0,
		updatedAt: null,
	})),
}
const vocabularyBody = {
	level: 1,
	count: 1,
	words: [{ id: 'w1', japanese: '猫', reading: 'ねこ', meaning: 'cat' }],
}

const event = (level: string, user = true) =>
	({
		locals: { user: user ? { id: 'u1' } : null },
		params: { level },
		fetch: vi.fn((path: string) =>
			Promise.resolve({
				status: 200,
				ok: true,
				json: async () => (path.startsWith('/api/levels') ? progressBody : vocabularyBody),
			} as Response),
		),
	}) as unknown as PageServerLoadEvent

/** The generated load type allows void; the success paths all return data. */
const loadLevel = (e: PageServerLoadEvent) =>
	load(e) as Promise<Exclude<Awaited<ReturnType<typeof load>>, void>>

describe('quiz/[level] load', () => {
	it('redirects to /login when signed out', async () => {
		await expect(load(event('1', false))).rejects.toMatchObject({
			status: 303,
			location: '/login',
		})
	})

	it.each(['0', '11', 'abc'])('404s for an invalid level %s', async (level) => {
		await expect(load(event(level))).rejects.toMatchObject({ status: 404 })
	})

	it.each(['1', '10'])('returns the level with its words and progress for %s', async (level) => {
		const e = event(level)
		const result = await loadLevel(e)

		expect(result.level).toEqual(LEVELS[Number(level) - 1])
		expect(result.words).toEqual(vocabularyBody.words)
		expect(result.count).toBe(1)
		expect(result.progress).toMatchObject({ level: Number(level), status: 'not_started' })
		expect(e.fetch).toHaveBeenCalledWith(`/api/words?level=${level}`)
	})
})
