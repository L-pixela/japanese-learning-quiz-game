import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core'

export const user = sqliteTable('user', {
	id: text('id')
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID()),
	username: text('username').notNull().unique(),
	passwordHash: text('password_hash').notNull(),
	points: integer('points').notNull().default(0),
	streak: integer('streak').notNull().default(0),
	lastQuizAt: integer('last_quiz_at', { mode: 'timestamp' }),
	rank: text('rank').notNull().default('shiragohan'),
	createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
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
