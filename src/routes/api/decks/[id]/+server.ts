import { json } from '@sveltejs/kit'
import { getDb } from '$lib/server/db'
import { deck } from '$lib/server/db/schema'
import { eq } from 'drizzle-orm'
import type { RequestHandler } from './$types'

export const PUT: RequestHandler = async ({ request, params, platform }) => {
	const { title, userId } = (await request.json()) as { title: string; userId: string }
	// TODO: once login API (#12) exists, get userId from the session instead of request body

	if (!title || typeof title !== 'string' || title.trim().length === 0) {
		return json({ error: 'title is required' }, { status: 400 })
	}

	const db = getDb(platform!.env.DB)

	const [existing] = await db.select().from(deck).where(eq(deck.id, params.id)).limit(1)

	if (!existing) {
		return json({ error: 'deck not found' }, { status: 404 })
	}

	if (existing.userId !== userId) {
		return json({ error: 'not authorized to edit this deck' }, { status: 403 })
	}

	const [updated] = await db.update(deck).set({ title }).where(eq(deck.id, params.id)).returning()

	return json({ deck: updated })
}

export const DELETE: RequestHandler = async ({ request, params, platform }) => {
	const { userId } = (await request.json()) as { userId: string }
	// TODO: once login API (#12) exists, get userId from the session instead of request body

	const db = getDb(platform!.env.DB)

	const [existing] = await db.select().from(deck).where(eq(deck.id, params.id)).limit(1)

	if (!existing) {
		return json({ error: 'deck not found' }, { status: 404 })
	}

	if (existing.userId !== userId) {
		return json({ error: 'not authorized to delete this deck' }, { status: 403 })
	}

	await db.delete(deck).where(eq(deck.id, params.id))

	return json({ success: true })
}
