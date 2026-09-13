import { pageApi } from '$lib/server/page-api'
import type { LevelProgress } from '$lib/levels'
import type { PageServerLoad } from './$types'

export type StudyWord = { id: string; japanese: string; reading: string; meaning: string }

export const load: PageServerLoad = async ({ fetch, url }) => {
	const requested = Number(url.searchParams.get('level'))
	const level = Number.isInteger(requested) && requested >= 1 && requested <= 10 ? requested : 1
	const [progress, vocabulary] = await Promise.all([
		pageApi<{ levels: LevelProgress[] }>(fetch, '/api/levels'),
		pageApi<{ level: number; count: number; words: StudyWord[] }>(
			fetch,
			`/api/words?level=${level}`,
		),
	])
	return { ...progress, ...vocabulary }
}
