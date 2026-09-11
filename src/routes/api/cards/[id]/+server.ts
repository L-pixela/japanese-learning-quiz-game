import { json } from '@sveltejs/kit'
import { getDb } from '$lib/server/db'
import { findCardWithDeckOwner } from '$lib/server/db/queries'
import { card } from '$lib/server/db/schema'
import { eq } from 'drizzle-orm'
import type { RequestHandler } from './$types'

export const PUT: RequestHandler = async ({ request, params, platform, locals }) => {
	const { front, back } = (await request.json()) as { front: string; back: string }
	const userId = locals.user?.id

	if (!userId) {
		return json({ error: 'unauthorized' }, { status: 401 })
	}

	if (!front || typeof front !== 'string' || front.trim().length === 0) {
		return json({ error: 'front is required' }, { status: 400 })
	}

	if (!back || typeof back !== 'string' || back.trim().length === 0) {
		return json({ error: 'back is required' }, { status: 400 })
	}

	const db = getDb(platform!.env.DB)

	const existing = await findCardWithDeckOwner(db, params.id)

	if (!existing) {
		return json({ error: 'card not found' }, { status: 404 })
	}

	if (existing.deckUserId !== userId) {
		return json({ error: 'not authorized to edit this card' }, { status: 403 })
	}

	const [updated] = await db
		.update(card)
		.set({ front, back })
		.where(eq(card.id, params.id))
		.returning()

	return json({ card: updated })
}

export const DELETE: RequestHandler = async ({ params, platform, locals }) => {
	const userId = locals.user?.id

	if (!userId) {
		return json({ error: 'unauthorized' }, { status: 401 })
	}

	const db = getDb(platform!.env.DB)

	const existing = await findCardWithDeckOwner(db, params.id)

	if (!existing) {
		return json({ error: 'card not found' }, { status: 404 })
	}

	if (existing.deckUserId !== userId) {
		return json({ error: 'not authorized to delete this card' }, { status: 403 })
	}

	await db.delete(card).where(eq(card.id, params.id))

	return json({ success: true })
}
