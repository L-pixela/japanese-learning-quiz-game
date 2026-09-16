import { json } from '@sveltejs/kit'
import { eq, sql } from 'drizzle-orm'
import { getDb, requireDb } from '$lib/server/db'
import { quizAttempt, word } from '$lib/server/db/schema'
import { QUESTION_TYPES, type QuestionType } from '$lib/quiz-types'
import type { RequestHandler } from './$types'

function secureRandomInt(maxExclusive: number): number {
	const range = 2 ** 32
	const limit = range - (range % maxExclusive)
	const values = new Uint32Array(1)

	do crypto.getRandomValues(values)
	while (values[0] >= limit)

	return values[0] % maxExclusive
}

function shuffle<T>(items: T[]): T[] {
	const result = [...items]
	for (let i = result.length - 1; i > 0; i--) {
		const j = secureRandomInt(i + 1)
		;[result[i], result[j]] = [result[j], result[i]]
	}
	return result
}

type Word = { japanese: string; reading: string; meaning: string }

/** The value a question asks you to pick, for each direction. */
const ANSWER: Record<QuestionType, (w: Word) => string> = {
	meaning: (w) => w.meaning,
	word: (w) => w.japanese,
	reading: (w) => w.reading,
}

/**
 * Four options: the answer plus three distinct decoys of the same kind, drawn
 * from the rest of the level so they are always plausible. Returns null when
 * the level cannot supply three different decoys.
 */
function buildOptions(correct: string, pool: string[]): string[] | null {
	const decoys = [...new Set(pool)].filter((value) => value !== correct)
	if (decoys.length < 3) return null
	return shuffle([correct, ...shuffle(decoys).slice(0, 3)])
}

/**
 * A word written only in kana cannot be asked as a reading question — the
 * prompt would already be the answer.
 */
function hasKanji(w: Word) {
	return w.japanese !== w.reading
}

export const POST: RequestHandler = async ({ locals, platform, request }) => {
	if (!locals.user) return json({ error: 'unauthorized' }, { status: 401 })
	const body = (await request.json().catch(() => null)) as Record<string, unknown> | null
	const level = body?.level
	if (typeof level !== 'number' || !Number.isInteger(level) || level < 1 || level > 10)
		return json({ error: 'level must be 1–10' }, { status: 400 })

	const db = getDb(requireDb(platform))
	// Pull a wider pool than the ten asked about, so decoys can come from the
	// whole level rather than only from the words already on screen.
	const pool = await db
		.select()
		.from(word)
		.where(eq(word.level, level))
		.orderBy(sql`random()`)
		.limit(40)

	if (pool.length < 10)
		return json(
			{ error: 'This level needs more vocabulary. Please try another level.' },
			{ status: 409 },
		)

	const asked = pool.slice(0, 10)
	const options: Record<QuestionType, string[]> = {
		meaning: pool.map((w) => w.meaning),
		word: pool.map((w) => w.japanese),
		reading: pool.map((w) => w.reading),
	}

	// Cycle the three directions so every quiz tests recognition, recall and
	// reading rather than recognition ten times over.
	const questions = asked.map((item, index) => {
		let type = QUESTION_TYPES[index % QUESTION_TYPES.length]
		if (type === 'reading' && !hasKanji(item)) type = 'meaning'

		let choices = buildOptions(ANSWER[type](item), options[type])
		// A level too small for one direction still works in another.
		if (!choices && type !== 'meaning') {
			type = 'meaning'
			choices = buildOptions(item.meaning, options.meaning)
		}
		if (!choices) return null

		return {
			type,
			japanese: item.japanese,
			reading: item.reading,
			meaning: item.meaning,
			options: choices,
			correctIndex: choices.indexOf(ANSWER[type](item)),
		}
	})

	if (questions.some((question) => question === null))
		return json({ error: 'This level needs more distinct vocabulary.' }, { status: 409 })
	const ready = shuffle(questions as NonNullable<(typeof questions)[number]>[])

	const [attempt] = await db
		.insert(quizAttempt)
		.values({ userId: locals.user.id, level, questions: ready })
		.returning({ id: quizAttempt.id })

	return json(
		{
			attemptId: attempt.id,
			level,
			// The answer key stays on the server; the prompt only carries what the
			// question type is allowed to reveal.
			questions: ready.map((question) => ({
				type: question.type,
				japanese: question.type === 'word' ? null : question.japanese,
				reading: question.type === 'meaning' ? question.reading : null,
				meaning: question.type === 'word' ? question.meaning : null,
				options: question.options,
			})),
		},
		{ status: 201, headers: { 'Cache-Control': 'no-store' } },
	)
}
