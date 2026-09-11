import { json } from '@sveltejs/kit'
import { getDb } from '$lib/server/db'
import { findDeckById } from '$lib/server/db/queries'
import { card } from '$lib/server/db/schema'
import { parseCardFields } from '$lib/server/validation/card'
import type { RequestHandler } from './$types'

export const POST: RequestHandler = async ({ request, params, platform, locals }) => {
	const userId = locals.user?.id
	const parsed = await parseCardFields(request, userId)

	if (!parsed.ok) {
		return parsed.error
	}

	const { front, back } = parsed

	const db = getDb(platform!.env.DB)

	const existing = await findDeckById(db, params.id)

	if (!existing) {
		return json({ error: 'deck not found' }, { status: 404 })
	}

	if (existing.userId !== userId) {
		return json({ error: 'not authorized to add cards to this deck' }, { status: 403 })
	}

	const [newCard] = await db.insert(card).values({ deckId: params.id, front, back }).returning()

	return json({ card: newCard }, { status: 201 })
}
