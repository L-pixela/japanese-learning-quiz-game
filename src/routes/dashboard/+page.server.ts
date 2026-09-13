import { pageApi } from '$lib/server/page-api'
import type { PageServerLoad } from './$types'
export const load: PageServerLoad = async ({ fetch }) => {
	const [profile, ranking] = await Promise.all([
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
			leaderboard: Array<{
				id: string
				username: string
				university: string | null
				points: number
				streak: number
				position: number
			}>
			position: number
		}>(fetch, '/api/leaderboard?pageSize=10&withPosition=true'),
	])
	return { ...profile, ...ranking }
}
