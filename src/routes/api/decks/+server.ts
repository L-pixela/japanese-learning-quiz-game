import { json } from '@sveltejs/kit'
import { getDb } from '$lib/server/db'
import { deck } from '$lib/server/db/schema'
import { eq } from 'drizzle-orm'
import type { RequestHandler } from './$types'

export const POST: RequestHandler = async ({ request, platform, locals }) => {
	const userId = locals.user?.id

	if (!userId) {
		return json({ error: 'unauthorized' }, { status: 401 })
	}

	const { title } = (await request.json()) as { title: string }

	if (!title || typeof title !== 'string' || title.trim().length === 0) {
		return json({ error: 'title is required' }, { status: 400 })
	}

	const db = getDb(platform!.env.DB)

	const [created] = await db
		.insert(deck)
		.values({
			userId,
			title: title.trim(),
		})
		.returning()

	return json({ deck: created }, { status: 201 })
}

export const GET: RequestHandler = async ({ platform, locals }) => {
	const userId = locals.user?.id

	if (!userId) {
		return json({ error: 'unauthorized' }, { status: 401 })
	}

	const db = getDb(platform!.env.DB)

	const decks = await db.select().from(deck).where(eq(deck.userId, userId))

	return json({ decks })
}
