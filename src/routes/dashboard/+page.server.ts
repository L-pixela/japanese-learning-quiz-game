import { pageApi } from '$lib/server/page-api'
import type { LevelProgress } from '$lib/levels'
import type { PageServerLoad } from './$types'
export const load: PageServerLoad = async ({ fetch }) => {
	const [profile, ranking, progress] = await Promise.all([
		pageApi<{
			user: {
				id: string
				username: string
				university: string | null
				points: number
				streak: number
				rank: string
			}
		}>(fetch, '/api/me'),
		pageApi<{
			leaderboard: Array<{ id: string; username: string; points: number; position: number }>
			position: number
		}>(fetch, '/api/leaderboard?pageSize=5&withPosition=true'),
		pageApi<{ levels: LevelProgress[] }>(fetch, '/api/levels'),
	])
	return { ...profile, ...ranking, ...progress }
}
