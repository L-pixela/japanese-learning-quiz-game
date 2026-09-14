import { and, eq, sql } from 'drizzle-orm'
import { getDb } from './db'
import { quizAttempt, user, userLevelProgress } from './db/schema'
import { LEVELS } from '$lib/levels'

export function gradeAnswers(
	questions: Array<{ correctIndex: number }>,
	answers: unknown,
): number | null {
	if (
		!Array.isArray(answers) ||
		answers.length !== 10 ||
		questions.length !== 10 ||
		answers.some((answer) => !Number.isInteger(answer) || answer < 0 || answer > 3)
	)
		return null
	return questions.reduce(
		(score, question, i) => score + Number(question.correctIndex === answers[i]),
		0,
	)
}
export async function getQuizResult(d1: D1Database, userId: string, attemptId: string) {
	const db = getDb(d1)
	const [attempt] = await db
		.select()
		.from(quizAttempt)
		.where(and(eq(quizAttempt.id, attemptId), eq(quizAttempt.userId, userId)))
		.limit(1)
	if (!attempt || attempt.score === null) return null
	const [stats] = await db
		.select({
			completedUsers: sql<number>`count(*)`,
			totalUsers: sql<number>`(select count(*) from user)`,
		})
		.from(userLevelProgress)
		.where(
			and(eq(userLevelProgress.level, attempt.level), eq(userLevelProgress.status, 'completed')),
		)
	const [profile] = await db
		.select({ points: user.points, streak: user.streak, rank: user.rank })
		.from(user)
		.where(eq(user.id, userId))
		.limit(1)
	return {
		attemptId,
		level: attempt.level,
		difficulty: LEVELS[attempt.level - 1].difficulty,
		score: attempt.score,
		totalCount: 10,
		passed: attempt.score >= 6,
		pointsEarned: attempt.score,
		user: profile,
		completion: {
			...stats,
			percentage: stats.totalUsers
				? Math.round((stats.completedUsers / stats.totalUsers) * 100)
				: 0,
		},
	}
}
// D1 batches are transactional. Guard all writes with the unconsumed attempt,
// then consume it last. Concurrent/retried submissions award exactly once.
export async function saveQuizScore(
	d1: D1Database,
	userId: string,
	attemptId: string,
	level: number,
	score: number,
	now = new Date(),
) {
	const timestamp = Math.floor(now.getTime() / 1000)
	await d1.batch([
		d1
			.prepare(
				`UPDATE user SET points = points + ?, streak = CASE WHEN date(last_quiz_at, 'unixepoch') = date(?, 'unixepoch') THEN streak WHEN date(last_quiz_at, 'unixepoch') = date(?, 'unixepoch', '-1 day') THEN streak + 1 ELSE 1 END, last_quiz_at = ? WHERE id = ? AND EXISTS (SELECT 1 FROM quiz_attempt WHERE id = ? AND user_id = ? AND submitted_at IS NULL)`,
			)
			.bind(score, timestamp, timestamp, timestamp, userId, attemptId, userId),
		d1
			.prepare(
				`UPDATE user SET rank = CASE WHEN points >= 80 THEN 'hinotama' WHEN points >= 60 THEN 'gekikara-kimchi' WHEN points >= 40 THEN 'ichimi-togarashi' WHEN points >= 30 THEN 'wasabi' WHEN points >= 20 THEN 'mentaiko' WHEN points >= 10 THEN 'umeboshi' ELSE 'shiragohan' END WHERE id = ? AND EXISTS (SELECT 1 FROM quiz_attempt WHERE id = ? AND user_id = ? AND submitted_at IS NULL)`,
			)
			.bind(userId, attemptId, userId),
		d1
			.prepare(
				`INSERT INTO user_level_progress (user_id, level, status, best_score, attempts, updated_at) SELECT ?, ?, ?, ?, 1, ? WHERE EXISTS (SELECT 1 FROM quiz_attempt WHERE id = ? AND user_id = ? AND submitted_at IS NULL) ON CONFLICT(user_id, level) DO UPDATE SET status = CASE WHEN user_level_progress.status = 'completed' OR excluded.status = 'completed' THEN 'completed' ELSE 'attempted' END, best_score = max(user_level_progress.best_score, excluded.best_score), attempts = user_level_progress.attempts + 1, updated_at = excluded.updated_at`,
			)
			.bind(
				userId,
				level,
				score >= 6 ? 'completed' : 'attempted',
				score,
				timestamp,
				attemptId,
				userId,
			),
		d1
			.prepare(
				'UPDATE quiz_attempt SET score = ?, submitted_at = ? WHERE id = ? AND user_id = ? AND submitted_at IS NULL',
			)
			.bind(score, timestamp, attemptId, userId),
	])
}
