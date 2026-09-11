import { json } from '@sveltejs/kit'
import { getDb } from '$lib/server/db'
import { findDeckById } from '$lib/server/db/queries'
import { card } from '$lib/server/db/schema'
import { DEFAULT_QUIZ_SIZE, MAX_QUIZ_SIZE } from '$lib/server/quiz'
import { eq, sql } from 'drizzle-orm'
import type { RequestHandler } from './$types'

/**
 * GET /api/decks/:id/quiz
 *
 * Fetches a random set of questions from a deck to serve as a quiz.
 * Requires the requesting user to own the deck.
 *
 * Query params:
 *   - count (optional) — number of questions to return. Defaults to 10,
 *     capped at MAX_QUIZ_SIZE.
 *
 * Example request:
 *   GET /api/decks/d1/quiz?count=5
 *
 * Example response (200):
 *   {
 *     "questions": [
 *       { "id": "c1", "front": "こんにちは" },
 *       { "id": "c2", "front": "ありがとう" }
 *     ]
 *   }
 */
export const GET: RequestHandler = async ({ params, url, platform, locals }) => {
	const userId = locals.user?.id

	if (!userId) {
		return json({ error: 'unauthorized' }, { status: 401 })
	}

	const db = getDb(platform!.env.DB)

	const existingDeck = await findDeckById(db, params.id)

	if (!existingDeck) {
		return json({ error: 'deck not found' }, { status: 404 })
	}

	if (existingDeck.userId !== userId) {
		return json({ error: 'not authorized to access this deck' }, { status: 403 })
	}

	const countParam = url.searchParams.get('count')
	let count = DEFAULT_QUIZ_SIZE

	if (countParam !== null) {
		const parsed = Number(countParam)
		if (!Number.isInteger(parsed) || parsed <= 0) {
			return json({ error: 'count must be a positive integer' }, { status: 400 })
		}
		if (parsed > MAX_QUIZ_SIZE) {
			return json({ error: `count must be at most ${MAX_QUIZ_SIZE}` }, { status: 400 })
		}
		count = parsed
	}

	const questions = await db
		.select({ id: card.id, front: card.front })
		.from(card)
		.where(eq(card.deckId, params.id))
		.orderBy(sql`RANDOM()`)
		.limit(count)

	if (questions.length === 0) {
		return json({ error: 'deck has no cards to quiz' }, { status: 400 })
	}

	return json({ questions })
}
