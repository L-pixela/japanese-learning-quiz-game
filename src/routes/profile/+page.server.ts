import { pageApi } from '$lib/server/page-api'
import type { PageServerLoad } from './$types'

export type Profile = {
	id: string
	username: string
	displayName: string | null
	university: string | null
	phone: string | null
	linkedin: string | null
	github: string | null
	bio: string | null
	avatar: string | null
	points: number
	streak: number
	rank: string
}
export type Attempt = { id: string; level: number; score: number; submittedAt: string | null }

export const load: PageServerLoad = async ({ fetch }) => {
	const [own, ranking] = await Promise.all([
		pageApi<{ profile: Profile; history: Attempt[] }>(fetch, '/api/profile'),
		pageApi<{ position: number | null }>(fetch, '/api/leaderboard?pageSize=1&withPosition=true'),
	])
	return { ...own, position: ranking.position }
}
