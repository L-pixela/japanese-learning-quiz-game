import { describe, expect, it, vi } from 'vitest'
import { load } from './+page.server'
import type { PageServerLoadEvent } from './$types'

const progressBody = { levels: [{ level: 1, status: 'not_started', bestScore: 0, attempts: 0 }] }
const vocabularyBody = {
	level: 1,
	count: 1,
	words: [{ id: 'w1', japanese: '猫', reading: 'ねこ', meaning: 'cat' }],
}

const event = (search = '') =>
	({
		fetch: vi.fn((path: string) =>
			Promise.resolve({
				status: 200,
				ok: true,
				json: async () => (path.startsWith('/api/levels') ? progressBody : vocabularyBody),
			} as Response),
		),
		url: { searchParams: new URLSearchParams(search) },
	}) as unknown as PageServerLoadEvent

describe('deck_list load', () => {
	it('defaults to level 1 when no level param is given', async () => {
		const e = event('')
		const result = await load(e)
		expect(result).toEqual({ ...progressBody, ...vocabularyBody })
		expect(e.fetch).toHaveBeenCalledWith('/api/words?level=1')
	})

	it('uses a valid requested level', async () => {
		const e = event('level=5')
		await load(e)
		expect(e.fetch).toHaveBeenCalledWith('/api/words?level=5')
	})

	it.each(['0', '11'])('falls back to level 1 for an out-of-range level %s', async (level) => {
		const e = event(`level=${level}`)
		await load(e)
		expect(e.fetch).toHaveBeenCalledWith('/api/words?level=1')
	})

	it('falls back to level 1 for a non-numeric level', async () => {
		const e = event('level=abc')
		await load(e)
		expect(e.fetch).toHaveBeenCalledWith('/api/words?level=1')
	})
})
