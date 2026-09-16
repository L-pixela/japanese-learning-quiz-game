import { error, redirect } from '@sveltejs/kit'
import { LEVELS, type LevelProgress } from '$lib/levels'
import { pageApi } from '$lib/server/page-api'
import type { PageServerLoad } from './$types'

export type StudyWord = { id: string; japanese: string; reading: string; meaning: string }

/**
 * One page per level: the words to study and the quiz over them live together,
 * so there is no separate deck section to navigate to and get lost in.
 */
export const load: PageServerLoad = async ({ locals, params, fetch }) => {
	if (!locals.user) redirect(303, '/login')
	const level = Number(params.level)
	if (!Number.isInteger(level) || level < 1 || level > 10) error(404, 'Level not found')

	const [progress, vocabulary] = await Promise.all([
		pageApi<{ levels: LevelProgress[] }>(fetch, '/api/levels'),
		pageApi<{ level: number; count: number; words: StudyWord[] }>(
			fetch,
			`/api/words?level=${level}`,
		),
	])

	return {
		level: LEVELS[level - 1],
		levels: progress.levels,
		progress: progress.levels.find((entry) => entry.level === level) ?? null,
		words: vocabulary.words,
		count: vocabulary.count,
	}
}
