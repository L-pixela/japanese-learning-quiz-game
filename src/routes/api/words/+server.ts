import { json } from '@sveltejs/kit'
import { asc, eq } from 'drizzle-orm'
import { getDb } from '$lib/server/db'
import { word } from '$lib/server/db/schema'
import type { RequestHandler } from './$types'

/**
 * GET /api/words
 *
 * Returns every vocabulary word behind one level, in a stable order, so a
 * learner can study the set the quiz draws its ten random questions from.
 * Requires an authenticated session.
 *
 * Query params:
 *   - level (required) — 1–10.
 *
 * Example response (200):
 *   {
 *     "level": 1,
 *     "count": 55,
 *     "words": [{ "id": "w1", "japanese": "米", "reading": "こめ", "meaning": "uncooked rice" }]
 *   }
 */
export const GET: RequestHandler = async ({ locals, platform, url }) => {
	if (!locals.user) return json({ error: 'unauthorized' }, { status: 401 })

	const level = Number(url.searchParams.get('level'))
	if (!Number.isInteger(level) || level < 1 || level > 10)
		return json({ error: 'level must be 1–10' }, { status: 400 })

	const words = await getDb(platform!.env.DB)
		.select({
			id: word.id,
			japanese: word.japanese,
			reading: word.reading,
			meaning: word.meaning,
		})
		.from(word)
		.where(eq(word.level, level))
		.orderBy(asc(word.japanese), asc(word.id))

	return json({ level, count: words.length, words }, { headers: { 'Cache-Control': 'no-store' } })
}
