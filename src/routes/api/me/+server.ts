import { json } from '@sveltejs/kit'
import { getDb } from '$lib/server/db'
import { user } from '$lib/server/db/schema'
import { eq } from 'drizzle-orm'
import type { RequestHandler } from './$types'

export const GET: RequestHandler = async ({ locals, platform }) => {
	if (!locals.user) {
		return json({ error: 'not authenticated' }, { status: 401 })
	}

	const db = getDb(platform!.env.DB)

	const [profile] = await db
		.select({
			id: user.id,
			username: user.username,
			points: user.points,
			streak: user.streak,
			rank: user.rank,
		})
		.from(user)
		.where(eq(user.id, locals.user.id))
		.limit(1)

	if (!profile) {
		return json({ error: 'user not found' }, { status: 404 })
	}

	return json({ user: profile })
}
