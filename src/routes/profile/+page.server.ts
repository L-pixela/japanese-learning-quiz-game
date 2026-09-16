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

type BoardEntry = { position: number; id: string; username: string; points: number }
type BoardPage = { leaderboard: BoardEntry[]; position?: number | null }

export const load: PageServerLoad = async ({ fetch }) => {
	// One call does double duty: it carries our own position and, as page 1,
	// the points of whoever currently holds #1.
	const [own, ranking] = await Promise.all([
		pageApi<{ profile: Profile; history: Attempt[] }>(fetch, '/api/profile'),
		pageApi<BoardPage>(fetch, '/api/leaderboard?pageSize=1&withPosition=true'),
	])

	const position = ranking.position ?? null
	const leaderPoints = ranking.leaderboard?.[0]?.points ?? null

	// The learner one rung up is the target that matters day to day, so fetch
	// exactly that row. Already first? Then there is nobody above to fetch.
	let nextUp: { position: number; username: string; points: number } | null = null
	if (position !== null && position > 1) {
		const above = await pageApi<BoardPage>(
			fetch,
			`/api/leaderboard?page=${position - 1}&pageSize=1`,
		)
		const entry = above.leaderboard?.[0]
		if (entry) nextUp = { position: entry.position, username: entry.username, points: entry.points }
	}

	return { ...own, position, leaderPoints, nextUp }
}
