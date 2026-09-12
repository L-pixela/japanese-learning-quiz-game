import { json } from '@sveltejs/kit'
import { eq } from 'drizzle-orm'
import type { getDb } from './index'
import { card, deck } from './schema'

type Db = ReturnType<typeof getDb>

export async function findDeckById(db: Db, id: string) {
	const [existing] = await db.select().from(deck).where(eq(deck.id, id)).limit(1)
	return existing
}

export async function requireDeckOwnership(
	db: Db,
	deckId: string,
	userId: string,
	action: string,
): Promise<{ ok: true } | { ok: false; error: Response }> {
	const existing = await findDeckById(db, deckId)

	if (!existing) {
		return { ok: false, error: json({ error: 'deck not found' }, { status: 404 }) }
	}

	if (existing.userId !== userId) {
		return {
			ok: false,
			error: json({ error: `not authorized to ${action} this deck` }, { status: 403 }),
		}
	}

	return { ok: true }
}

export async function findCardWithDeckOwner(db: Db, id: string) {
	const [existing] = await db
		.select({
			id: card.id,
			deckId: card.deckId,
			front: card.front,
			back: card.back,
			deckUserId: deck.userId,
		})
		.from(card)
		.innerJoin(deck, eq(card.deckId, deck.id))
		.where(eq(card.id, id))
		.limit(1)
	return existing
}
