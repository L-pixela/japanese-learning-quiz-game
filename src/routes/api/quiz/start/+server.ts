import { json } from '@sveltejs/kit'
import { eq, sql } from 'drizzle-orm'
import { getDb } from '$lib/server/db'
import { quizAttempt, word } from '$lib/server/db/schema'
import type { RequestHandler } from './$types'

function shuffle<T>(items: T[]): T[] {
	const result = [...items]
	for (let i = result.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1))
		;[result[i], result[j]] = [result[j], result[i]]
	}
	return result
}
export const POST: RequestHandler = async ({ locals, platform, request }) => {
	if (!locals.user) return json({ error: 'unauthorized' }, { status: 401 })
	const body = (await request.json().catch(() => null)) as Record<string, unknown> | null
	const level = body?.level
	if (typeof level !== 'number' || !Number.isInteger(level) || level < 1 || level > 10)
		return json({ error: 'level must be 1–10' }, { status: 400 })
	const db = getDb(platform!.env.DB)
	const words = await db
		.select()
		.from(word)
		.where(eq(word.level, level))
		.orderBy(sql`random()`)
		.limit(10)
	if (words.length < 10)
		return json(
			{ error: 'This level needs more vocabulary. Please try another level.' },
			{ status: 409 },
		)
	const meanings = [...new Set(words.map((item) => item.meaning))]
	if (meanings.length < 4)
		return json({ error: 'This level needs more distinct meanings.' }, { status: 409 })
	const questions = words.map((item) => {
		const options = shuffle([
			item.meaning,
			...shuffle(meanings.filter((meaning) => meaning !== item.meaning)).slice(0, 3),
		])
		return {
			japanese: item.japanese,
			reading: item.reading,
			options,
			correctIndex: options.indexOf(item.meaning),
		}
	})
	const [attempt] = await db
		.insert(quizAttempt)
		.values({ userId: locals.user.id, level, questions })
		.returning({ id: quizAttempt.id })
	return json(
		{
			attemptId: attempt.id,
			level,
			questions: questions.map(({ japanese, reading, options }) => ({
				japanese,
				reading,
				options,
			})),
		},
		{ status: 201, headers: { 'Cache-Control': 'no-store' } },
	)
}
