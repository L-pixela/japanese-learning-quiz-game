import { json } from '@sveltejs/kit'
import { getDb } from '$lib/server/db'
import { card, deck } from '$lib/server/db/schema'
import { eq } from 'drizzle-orm'
import type { RequestHandler } from './$types'

export const POST: RequestHandler = async ({ request, params, platform, locals }) => {
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

	const [existing] = await db.select().from(deck).where(eq(deck.id, params.id)).limit(1)

	if (!existing) {
		return json({ error: 'deck not found' }, { status: 404 })
	}

	if (existing.userId !== userId) {
		return json({ error: 'not authorized to add cards to this deck' }, { status: 403 })
	}

	const [newCard] = await db.insert(card).values({ deckId: params.id, front, back }).returning()

	return json({ card: newCard }, { status: 201 })
}
