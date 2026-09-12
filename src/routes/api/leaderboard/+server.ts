import { json } from '@sveltejs/kit'
import { getDb } from '$lib/server/db'
import { user } from '$lib/server/db/schema'
import { DEFAULT_LEADERBOARD_PAGE_SIZE, MAX_LEADERBOARD_PAGE_SIZE } from '$lib/server/leaderboard'
import { asc, desc } from 'drizzle-orm'
import type { RequestHandler } from './$types'

/**
 * GET /api/leaderboard
 *
 * Returns a page of the global leaderboard, ranked by points (descending),
 * with streak as a tiebreaker (descending). Requires an authenticated session.
 *
 * Query params:
 *   - page (optional) — 1-indexed page number. Defaults to 1.
 *   - pageSize (optional) — number of entries per page. Defaults to 20,
 *     capped at MAX_LEADERBOARD_PAGE_SIZE.
 *
 * Example request:
 *   GET /api/leaderboard?page=2&pageSize=10
 *
 * Example response (200):
 *   {
 *     "leaderboard": [
 *       { "position": 11, "id": "u1", "username": "alice", "points": 340, "streak": 12, "rank": "wasabi" }
 *     ],
 *     "page": 2,
 *     "pageSize": 10
 *   }
 */
export const GET: RequestHandler = async ({ url, platform, locals }) => {
	const userId = locals.user?.id

	if (!userId) {
		return json({ error: 'unauthorized' }, { status: 401 })
	}

	const pageParam = url.searchParams.get('page')
	let page = 1

	if (pageParam !== null) {
		const parsed = Number(pageParam)
		if (!Number.isInteger(parsed) || parsed <= 0) {
			return json({ error: 'page must be a positive integer' }, { status: 400 })
		}
		page = parsed
	}

	const pageSizeParam = url.searchParams.get('pageSize')
	let pageSize = DEFAULT_LEADERBOARD_PAGE_SIZE

	if (pageSizeParam !== null) {
		const parsed = Number(pageSizeParam)
		if (!Number.isInteger(parsed) || parsed <= 0) {
			return json({ error: 'pageSize must be a positive integer' }, { status: 400 })
		}
		if (parsed > MAX_LEADERBOARD_PAGE_SIZE) {
			return json(
				{ error: `pageSize must be at most ${MAX_LEADERBOARD_PAGE_SIZE}` },
				{ status: 400 },
			)
		}
		pageSize = parsed
	}

	const offset = (page - 1) * pageSize

	const db = getDb(platform!.env.DB)

	const rows = await db
		.select({
			id: user.id,
			username: user.username,
			points: user.points,
			streak: user.streak,
			rank: user.rank,
		})
		.from(user)
		.orderBy(desc(user.points), desc(user.streak), asc(user.createdAt))
		.limit(pageSize)
		.offset(offset)

	const leaderboard = rows.map((row, i) => ({ position: offset + i + 1, ...row }))

	return json({ leaderboard, page, pageSize })
}
