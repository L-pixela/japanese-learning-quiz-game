import { json } from '@sveltejs/kit'
import { eq } from 'drizzle-orm'
import { getDb, requireDb } from '$lib/server/db'
import { user } from '$lib/server/db/schema'
import type { RequestHandler } from './$types'

export const GET: RequestHandler = async ({ locals, platform, params }) => {
	if (!locals.user) return json({ error: 'unauthorized' }, { status: 401 })

	const db = getDb(requireDb(platform))
	const [profile] = await db
		.select({
			id: user.id,
			username: user.username,
			displayName: user.displayName,
			university: user.university,
			linkedin: user.linkedin,
			github: user.github,
			bio: user.bio,
			avatar: user.avatar,
			points: user.points,
			streak: user.streak,
			rank: user.rank,
		})
		.from(user)
		.where(eq(user.id, params.id))
		.limit(1)

	if (!profile) return json({ error: 'not found' }, { status: 404 })

	return json({ profile }, { headers: { 'Cache-Control': 'no-store' } })
}
