import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { createTestD1 } from './db/test-d1'
import { gradeAnswers, saveQuizScore, getQuizResult } from './level-quiz'

describe('user_level_progress and quiz scoring', () => {
	let db: ReturnType<typeof createTestD1>
	beforeEach(() => {
		db = createTestD1()
		db.sqlite.exec(
			"INSERT INTO user(id,username,password_hash) VALUES ('u1','alice','hash'),('u2','bob','hash')",
		)
	})
	afterEach(() => db.sqlite.close())
	/** These cases assert scoring and progress, not the answer sheet itself. */
	const anyAnswers = Array.from({ length: 10 }, () => 0)
	function attempt(id: string, level = 1) {
		db.sqlite
			.prepare(
				'INSERT INTO quiz_attempt(id,user_id,level,questions,created_at) VALUES (?, ?, ?, ?, ?)',
			)
			.run(
				id,
				'u1',
				level,
				JSON.stringify(Array.from({ length: 10 }, () => ({ correctIndex: 0 }))),
				1,
			)
	}
	it('grades exactly ten valid choices, including zero and ten', () => {
		const questions = Array.from({ length: 10 }, () => ({ correctIndex: 0 }))
		expect(gradeAnswers(questions, Array(10).fill(0))).toBe(10)
		expect(gradeAnswers(questions, Array(10).fill(1))).toBe(0)
		for (const answers of [
			null,
			[],
			Array(9).fill(0),
			Array(11).fill(0),
			Array(10).fill(-1),
			Array(10).fill(4),
			Array(10).fill(0.5),
			Array(10).fill('0'),
		])
			expect(gradeAnswers(questions, answers)).toBeNull()
	})
	it('fails at five, passes at six, preserves completion and the best score on a failed retry', async () => {
		for (const [id, score] of [
			['a', 5],
			['b', 6],
			['c', 2],
		] as const) {
			attempt(id)
			await saveQuizScore(db.d1, 'u1', id, 1, score, anyAnswers)
			expect(
				db.sqlite.prepare("SELECT status FROM user_level_progress WHERE user_id='u1'").get()
					?.status,
			).toBe(id === 'a' ? 'attempted' : 'completed')
		}
		expect(
			db.sqlite.prepare('SELECT best_score, attempts FROM user_level_progress').get(),
		).toMatchObject({ best_score: 6, attempts: 3 })
		expect(db.sqlite.prepare("SELECT points FROM user WHERE id='u1'").get()?.points).toBe(13)
	})
	it('awards a replay once and keeps other users and levels untouched', async () => {
		attempt('a')
		await saveQuizScore(db.d1, 'u1', 'a', 1, 8, anyAnswers)
		await saveQuizScore(db.d1, 'u1', 'a', 1, 10, anyAnswers)
		expect(db.sqlite.prepare("SELECT points FROM user WHERE id='u1'").get()?.points).toBe(8)
		expect(db.sqlite.prepare('SELECT attempts FROM user_level_progress').get()?.attempts).toBe(1)
		expect(db.sqlite.prepare("SELECT points FROM user WHERE id='u2'").get()?.points).toBe(0)
	})
	it('uses UTC calendar days for streaks, including a missed-day gap shorter than 48 hours', async () => {
		for (const [id, time, expected] of [
			['a', '2026-09-10T23:00:00Z', 1],
			['b', '2026-09-10T23:59:00Z', 1],
			['c', '2026-09-11T23:30:00Z', 2],
			['d', '2026-09-13T00:01:00Z', 1],
		] as const) {
			attempt(id)
			await saveQuizScore(db.d1, 'u1', id, 1, 6, anyAnswers, new Date(time))
			expect(db.sqlite.prepare("SELECT streak FROM user WHERE id='u1'").get()?.streak).toBe(
				expected,
			)
		}
	})
	it('counts each completed learner once and scopes persisted results to the owner', async () => {
		attempt('a')
		attempt('b')
		await saveQuizScore(db.d1, 'u1', 'a', 1, 7, anyAnswers)
		await saveQuizScore(db.d1, 'u1', 'b', 1, 9, anyAnswers)
		expect(await getQuizResult(db.d1, 'u1', 'a')).toMatchObject({
			score: 7,
			pointsEarned: 7,
			passed: true,
			completion: { completedUsers: 1, totalUsers: 2, percentage: 50 },
		})
		expect(await getQuizResult(db.d1, 'u2', 'a')).toBeNull()
	})
	it('returns a per-question review of what was chosen against what was right', async () => {
		// Real questions this time: the review echoes the option text back.
		db.sqlite
			.prepare(
				'INSERT INTO quiz_attempt(id,user_id,level,questions,created_at) VALUES (?, ?, ?, ?, ?)',
			)
			.run(
				'r',
				'u1',
				1,
				JSON.stringify(
					Array.from({ length: 10 }, (_, i) => ({
						japanese: 'word' + i,
						reading: 'reading' + i,
						options: ['right', 'wrong', 'c', 'd'],
						correctIndex: 0,
					})),
				),
				1,
			)
		// Miss the first two, get the rest.
		const answers = [1, 1, 0, 0, 0, 0, 0, 0, 0, 0]
		await saveQuizScore(db.d1, 'u1', 'r', 1, 8, answers)

		const result = await getQuizResult(db.d1, 'u1', 'r')
		expect(result?.review).toHaveLength(10)
		expect(result?.review?.[0]).toEqual({
			japanese: 'word0',
			reading: 'reading0',
			options: ['right', 'wrong', 'c', 'd'],
			correctIndex: 0,
			chosenIndex: 1,
			correct: false,
		})
		expect(result?.review?.filter((item) => !item.correct)).toHaveLength(2)
		expect(result?.review?.[2].correct).toBe(true)
	})
	it('reports no review for an attempt saved before answers were recorded', async () => {
		attempt('old')
		db.sqlite.exec("UPDATE quiz_attempt SET score=7, submitted_at=1 WHERE id='old'")
		expect((await getQuizResult(db.d1, 'u1', 'old'))?.review).toBeNull()
	})
	it('enforces unique user/level pairs, valid statuses, score range and cascading deletion', () => {
		db.sqlite.exec("INSERT INTO user_level_progress VALUES ('u1',1,'completed',6,1,1)")
		for (const values of [
			"'u1',1,'completed',6,1,1",
			"'u1',11,'attempted',0,1,1",
			"'u1',2,'wrong',0,1,1",
			"'u1',2,'completed',11,1,1",
		]) {
			expect(() =>
				db.sqlite.exec('INSERT INTO user_level_progress VALUES (' + values + ')'),
			).toThrow()
		}
		db.sqlite.exec("DELETE FROM user WHERE id='u1'")
		expect(
			db.sqlite.prepare('SELECT count(*) AS count FROM user_level_progress').get()?.count,
		).toBe(0)
	})
	it('rolls the whole batch back when progress cannot be saved', async () => {
		attempt('a')
		db.sqlite.exec(
			"CREATE TRIGGER reject_progress BEFORE INSERT ON user_level_progress BEGIN SELECT RAISE(ABORT, 'test failure'); END",
		)
		await expect(saveQuizScore(db.d1, 'u1', 'a', 1, 8, anyAnswers)).rejects.toThrow()
		expect(db.sqlite.prepare("SELECT points FROM user WHERE id='u1'").get()?.points).toBe(0)
		expect(
			db.sqlite.prepare("SELECT submitted_at FROM quiz_attempt WHERE id='a'").get()?.submitted_at,
		).toBeNull()
	})
})
