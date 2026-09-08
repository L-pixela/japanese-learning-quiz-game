import { json } from '@sveltejs/kit'
import { getDb } from '$lib/server/db'
import { user } from '$lib/server/db/schema'
import { eq } from 'drizzle-orm'
import type { RequestHandler } from './$types'

// TODO: once Rivath's rank calculation module (#10) exists, replace this with
// an import from $lib/server/rank instead of duplicating the logic here.
function getRankFromStreak(streak: number): string {
	if (streak >= 100) return 'hinotama'
	if (streak >= 60) return 'gekikara-kimchi'
	if (streak >= 30) return 'ichimi-togarashi'
	if (streak >= 14) return 'wasabi'
	if (streak >= 7) return 'mentaiko'
	if (streak >= 3) return 'umeboshi'
	return 'shiragohan'
}

function isSameDay(a: Date, b: Date): boolean {
	return (
		a.getFullYear() === b.getFullYear() &&
		a.getMonth() === b.getMonth() &&
		a.getDate() === b.getDate()
	)
}

function isConsecutiveDay(previous: Date, now: Date): boolean {
	const oneDayMs = 24 * 60 * 60 * 1000
	const diff = now.getTime() - previous.getTime()
	return diff > 0 && diff <= oneDayMs * 2 && !isSameDay(previous, now)
}

export const POST: RequestHandler = async ({ request, platform }) => {
	const { userId, correctCount, totalCount } = (await request.json()) as {
		userId: string
		correctCount: number
		totalCount: number
	}

	if (!userId || typeof correctCount !== 'number' || typeof totalCount !== 'number') {
		return json({ error: 'userId, correctCount, and totalCount are required' }, { status: 400 })
	}

	if (correctCount < 0 || totalCount <= 0 || correctCount > totalCount) {
		return json({ error: 'invalid correctCount/totalCount values' }, { status: 400 })
	}

	const db = getDb(platform!.env.DB)

	const [existingUser] = await db.select().from(user).where(eq(user.id, userId)).limit(1)

	if (!existingUser) {
		return json({ error: 'user not found' }, { status: 404 })
	}

	const pointsEarned = correctCount * 10
	const now = new Date()

	let newStreak: number
	if (!existingUser.lastQuizAt) {
		newStreak = 1
	} else if (isSameDay(existingUser.lastQuizAt, now)) {
		newStreak = existingUser.streak
	} else if (isConsecutiveDay(existingUser.lastQuizAt, now)) {
		newStreak = existingUser.streak + 1
	} else {
		newStreak = 1
	}

	const newPoints = existingUser.points + pointsEarned
	const newRank = getRankFromStreak(newStreak)

	const [updatedUser] = await db
		.update(user)
		.set({
			points: newPoints,
			streak: newStreak,
			lastQuizAt: now,
			rank: newRank,
		})
		.where(eq(user.id, userId))
		.returning({
			id: user.id,
			username: user.username,
			points: user.points,
			streak: user.streak,
			rank: user.rank,
		})

	return json({
		pointsEarned,
		user: updatedUser,
	})
}
