import { json } from '@sveltejs/kit'
import { getDb } from '$lib/server/db'
import { requireDeckOwnership } from '$lib/server/db/queries'
import { card } from '$lib/server/db/schema'
import { parseCardFields } from '$lib/server/validation/card'
import { eq } from 'drizzle-orm'
import type { RequestHandler } from './$types'

export const POST: RequestHandler = async ({ request, params, platform, locals }) => {
	const userId = locals.user?.id
	const parsed = await parseCardFields(request, userId)

	if (!parsed.ok) {
		return parsed.error
	}

	const { front, back } = parsed

	const db = getDb(platform!.env.DB)

	const ownership = await requireDeckOwnership(db, params.id, userId!, 'add cards to')
	if (!ownership.ok) {
		return ownership.error
	}

	const [newCard] = await db.insert(card).values({ deckId: params.id, front, back }).returning()

	return json({ card: newCard }, { status: 201 })
}

export const GET: RequestHandler = async ({ params, platform, locals }) => {
	const userId = locals.user?.id

	if (!userId) {
		return json({ error: 'unauthorized' }, { status: 401 })
	}

	const db = getDb(platform!.env.DB)

	const ownership = await requireDeckOwnership(db, params.id, userId, 'access')
	if (!ownership.ok) {
		return ownership.error
	}

	const cards = await db.select().from(card).where(eq(card.deckId, params.id))

	return json({ cards })
}
