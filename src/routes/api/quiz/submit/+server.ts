import { json } from '@sveltejs/kit'
import { and, eq } from 'drizzle-orm'
import { getDb, requireDb } from '$lib/server/db'
import { quizAttempt } from '$lib/server/db/schema'
import { gradeAnswers, saveQuizScore, getQuizResult } from '$lib/server/level-quiz'
import type { RequestHandler } from './$types'

export const POST: RequestHandler = async ({ request, platform, locals }) => {
	if (!locals.user) return json({ error: 'unauthorized' }, { status: 401 })
	const body = (await request.json().catch(() => null)) as Record<string, unknown> | null
	if (!body || typeof body.attemptId !== 'string')
		return json({ error: 'attemptId and 10 answers are required' }, { status: 400 })
	const d1 = requireDb(platform)
	const [attempt] = await getDb(d1)
		.select()
		.from(quizAttempt)
		.where(and(eq(quizAttempt.id, body.attemptId), eq(quizAttempt.userId, locals.user.id)))
		.limit(1)
	if (!attempt) return json({ error: 'quiz attempt not found' }, { status: 404 })
	const score = gradeAnswers(attempt.questions, body.answers)
	if (score === null)
		return json({ error: 'Provide exactly 10 answer indices from 0 to 3' }, { status: 400 })
	if (!attempt.submittedAt)
		await saveQuizScore(d1, locals.user.id, attempt.id, attempt.level, score)
	return json(await getQuizResult(d1, locals.user.id, attempt.id), {
		headers: { 'Cache-Control': 'no-store' },
	})
}
