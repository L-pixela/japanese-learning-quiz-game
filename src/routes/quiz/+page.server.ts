import { pageApi } from '$lib/server/page-api'
import type { LevelProgress } from '$lib/levels'
import type { PageServerLoad } from './$types'
export const load: PageServerLoad = ({ fetch }) =>
	pageApi<{ levels: LevelProgress[] }>(fetch, '/api/levels')
