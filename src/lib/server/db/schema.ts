import { sql } from 'drizzle-orm'
import { check, index, integer, primaryKey, sqliteTable, text } from 'drizzle-orm/sqlite-core'

export const user = sqliteTable(
	'user',
	{
		id: text('id')
			.primaryKey()
			.$defaultFn(() => crypto.randomUUID()),
		username: text('username').notNull().unique(),
		passwordHash: text('password_hash').notNull(),
		university: text('university'),
		displayName: text('display_name'),
		phone: text('phone'),
		linkedin: text('linkedin'),
		github: text('github'),
		bio: text('bio'),
		// A square data: URL (resized in the browser) or a path to a bundled image.
		avatar: text('avatar'),
		points: integer('points').notNull().default(0),
		streak: integer('streak').notNull().default(0),
		lastQuizAt: integer('last_quiz_at', { mode: 'timestamp' }),
		rank: text('rank').notNull().default('shiragohan'),
		createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
	},
	(table) => [
		index('user_points_streak_idx').on(sql`${table.points} desc`, sql`${table.streak} desc`),
	],
)

export const session = sqliteTable('session', {
	id: text('id').primaryKey(),
	userId: text('user_id')
		.notNull()
		.references(() => user.id),
	expiresAt: integer('expires_at', { mode: 'timestamp' }).notNull(),
})

export const deck = sqliteTable('deck', {
	id: text('id')
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID()),
	userId: text('user_id')
		.notNull()
		.references(() => user.id, { onDelete: 'cascade' }),
	title: text('title').notNull(),
	createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
})

export const card = sqliteTable('card', {
	id: text('id')
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID()),
	deckId: text('deck_id')
		.notNull()
		.references(() => deck.id, { onDelete: 'cascade' }),
	front: text('front').notNull(),
	back: text('back').notNull(),
})

export const word = sqliteTable(
	'word',
	{
		id: text('id')
			.primaryKey()
			.$defaultFn(() => crypto.randomUUID()),
		japanese: text('japanese').notNull(),
		reading: text('reading').notNull(),
		meaning: text('meaning').notNull(),
		level: integer('level').notNull(),
	},
	(table) => [index('word_level_idx').on(table.level)],
)

export const userLevelProgress = sqliteTable(
	'user_level_progress',
	{
		userId: text('user_id')
			.notNull()
			.references(() => user.id, { onDelete: 'cascade' }),
		level: integer('level').notNull(),
		status: text('status', { enum: ['not_started', 'attempted', 'completed'] })
			.notNull()
			.default('not_started'),
		bestScore: integer('best_score').notNull().default(0),
		attempts: integer('attempts').notNull().default(0),
		updatedAt: integer('updated_at', { mode: 'timestamp' })
			.notNull()
			.$defaultFn(() => new Date()),
	},
	(table) => [
		primaryKey({ columns: [table.userId, table.level] }),
		index('progress_level_status_idx').on(table.level, table.status),
		check('progress_level_range', sql`${table.level} between 1 and 10`),
		check('progress_score_range', sql`${table.bestScore} between 0 and 10`),
		check('progress_attempts_positive', sql`${table.attempts} >= 0`),
		check(
			'progress_status_valid',
			sql`${table.status} in ('not_started', 'attempted', 'completed')`,
		),
	],
)

// Snapshot answers on the server so edits to vocabulary cannot change an active quiz.
export const quizAttempt = sqliteTable(
	'quiz_attempt',
	{
		id: text('id')
			.primaryKey()
			.$defaultFn(() => crypto.randomUUID()),
		userId: text('user_id')
			.notNull()
			.references(() => user.id, { onDelete: 'cascade' }),
		level: integer('level').notNull(),
		questions: text('questions', { mode: 'json' })
			.$type<
				Array<{ japanese: string; reading: string; options: string[]; correctIndex: number }>
			>()
			.notNull(),
		// The indices the learner picked, in question order. Kept alongside the
		// questions so the results screen can show what went wrong, not just how
		// many. Null for attempts started before this column existed.
		answers: text('answers', { mode: 'json' }).$type<number[]>(),
		score: integer('score'),
		createdAt: integer('created_at', { mode: 'timestamp' })
			.notNull()
			.$defaultFn(() => new Date()),
		submittedAt: integer('submitted_at', { mode: 'timestamp' }),
	},
	(table) => [index('attempt_user_idx').on(table.userId)],
)
