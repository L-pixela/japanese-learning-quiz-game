import { json } from '@sveltejs/kit'
import { and, desc, eq } from 'drizzle-orm'
import { getDb, requireDb } from '$lib/server/db'
import { quizAttempt, user } from '$lib/server/db/schema'
import type { RequestHandler } from './$types'

/** Free-text profile fields and how long each may be. */
const FIELDS = {
	displayName: 60,
	university: 200,
	phone: 40,
	linkedin: 200,
	github: 100,
	bio: 500,
} as const
type Field = keyof typeof FIELDS

/**
 * Avatars are stored inline rather than in object storage: the browser crops
 * and resizes to a small square first, so a picture costs a few tens of KB and
 * needs no bucket, no signed URLs and no cleanup job. The cap keeps a row well
 * inside D1's limits even if a client skips the resize.
 */
const AVATAR_MAX_BYTES = 256 * 1024
function avatarError(value: unknown): string | null {
	if (typeof value !== 'string') return 'avatar must be text'
	if (value === '') return null
	const isBundled = value.startsWith('/') && !value.startsWith('//')
	const isInlineImage = /^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/=]+$/.test(value)
	if (!isBundled && !isInlineImage) return 'avatar must be an image'
	if (value.length > AVATAR_MAX_BYTES) return 'avatar is too large'
	return null
}

/**
 * GET /api/profile
 *
 * The signed-in learner's profile, their standing, and their finished quizzes,
 * newest first. Requires a session.
 */
export const GET: RequestHandler = async ({ locals, platform }) => {
	if (!locals.user) return json({ error: 'unauthorized' }, { status: 401 })
	const db = getDb(requireDb(platform))

	const [profile] = await db
		.select({
			id: user.id,
			username: user.username,
			displayName: user.displayName,
			university: user.university,
			phone: user.phone,
			linkedin: user.linkedin,
			github: user.github,
			bio: user.bio,
			avatar: user.avatar,
			points: user.points,
			streak: user.streak,
			rank: user.rank,
		})
		.from(user)
		.where(eq(user.id, locals.user.id))
		.limit(1)
	if (!profile) return json({ error: 'not found' }, { status: 404 })

	const history = await db
		.select({
			id: quizAttempt.id,
			level: quizAttempt.level,
			score: quizAttempt.score,
			submittedAt: quizAttempt.submittedAt,
		})
		.from(quizAttempt)
		.where(and(eq(quizAttempt.userId, locals.user.id)))
		.orderBy(desc(quizAttempt.createdAt))
		.limit(50)

	// An unsubmitted attempt is a quiz someone walked away from; it is not history.
	return json(
		{ profile, history: history.filter((row) => row.score !== null && row.submittedAt !== null) },
		{ headers: { 'Cache-Control': 'no-store' } },
	)
}

/**
 * PATCH /api/profile
 *
 * Updates any subset of the editable fields. An empty string clears a field.
 * Values are trimmed; anything over its length limit is rejected rather than
 * silently truncated, so the learner is told what happened.
 */
export const PATCH: RequestHandler = async ({ locals, platform, request }) => {
	if (!locals.user) return json({ error: 'unauthorized' }, { status: 401 })
	const body = (await request.json().catch(() => null)) as Record<string, unknown> | null
	if (!body || typeof body !== 'object') return json({ error: 'invalid body' }, { status: 400 })

	const updates: Partial<Record<Field | 'avatar', string | null>> = {}
	if ('avatar' in body) {
		const problem = avatarError(body.avatar)
		if (problem) return json({ error: problem }, { status: 400 })
		updates.avatar = (body.avatar as string) || null
	}
	for (const [field, limit] of Object.entries(FIELDS) as Array<[Field, number]>) {
		if (!(field in body)) continue
		const value = body[field]
		if (value === null) {
			updates[field] = null
			continue
		}
		if (typeof value !== 'string') return json({ error: `${field} must be text` }, { status: 400 })
		const trimmed = value.trim()
		if (trimmed.length > limit)
			return json({ error: `${field} must be at most ${limit} characters` }, { status: 400 })
		updates[field] = trimmed || null
	}

	if (Object.keys(updates).length === 0)
		return json({ error: 'no editable fields provided' }, { status: 400 })

	const db = getDb(requireDb(platform))
	const [saved] = await db.update(user).set(updates).where(eq(user.id, locals.user.id)).returning({
		id: user.id,
		username: user.username,
		displayName: user.displayName,
		university: user.university,
		phone: user.phone,
		linkedin: user.linkedin,
		github: user.github,
		bio: user.bio,
	})

	if (!saved) return json({ error: 'user not found' }, { status: 404 })

	return json({ profile: saved }, { headers: { 'Cache-Control': 'no-store' } })
}
