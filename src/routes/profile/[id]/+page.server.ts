import { pageApi } from '$lib/server/page-api'
import type { PageServerLoad } from './$types'

export type PublicProfile = {
	id: string
	username: string
	displayName: string | null
	university: string | null
	linkedin: string | null
	github: string | null
	bio: string | null
	avatar: string | null
	points: number
	streak: number
	rank: string
}

export const load: PageServerLoad = async ({ fetch, params }) =>
	pageApi<{ profile: PublicProfile }>(fetch, `/api/profile/${encodeURIComponent(params.id)}`)
