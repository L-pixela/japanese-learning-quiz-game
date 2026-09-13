import { error, redirect } from '@sveltejs/kit'
import { getQuizResult } from '$lib/server/level-quiz'
import type { PageServerLoad } from './$types'
export const load: PageServerLoad = async ({ locals, platform, url }) => {
	if (!locals.user) redirect(303, '/login')
	const attemptId = url.searchParams.get('attempt')
	if (!attemptId) return { result: null }
	const result = await getQuizResult(platform!.env.DB, locals.user.id, attemptId)
	if (!result) error(404, 'Completed quiz not found')
	return { result }
}
