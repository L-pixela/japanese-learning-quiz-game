import { error, redirect } from '@sveltejs/kit'
import { LEVELS } from '$lib/levels'
import type { PageServerLoad } from './$types'
export const load: PageServerLoad = ({ locals, params }) => {
	if (!locals.user) redirect(303, '/login')
	const level = Number(params.level)
	if (!Number.isInteger(level) || level < 1 || level > 10) error(404, 'Level not found')
	return { level: LEVELS[level - 1] }
}
