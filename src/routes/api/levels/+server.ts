import { json } from '@sveltejs/kit'
import { eq } from 'drizzle-orm'
import { getDb, requireDb } from '$lib/server/db'
import { userLevelProgress } from '$lib/server/db/schema'
import { LEVELS } from '$lib/levels'
import type { RequestHandler } from './$types'

export const GET: RequestHandler = async ({ locals, platform }) => {
	if (!locals.user) return json({ error: 'unauthorized' }, { status: 401 })
	const rows = await getDb(requireDb(platform))
		.select()
		.from(userLevelProgress)
		.where(eq(userLevelProgress.userId, locals.user.id))
	return json(
		{
			levels: LEVELS.map((level) => {
				const progress = rows.find((row) => row.level === level.level)
				return {
					...level,
					status: progress?.status ?? 'not_started',
					bestScore: progress?.bestScore ?? 0,
					attempts: progress?.attempts ?? 0,
					updatedAt: progress?.updatedAt ?? null,
				}
			}),
		},
		{ headers: { 'Cache-Control': 'no-store' } },
	)
}
