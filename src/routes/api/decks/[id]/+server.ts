import { json } from '@sveltejs/kit'
import { getDb } from '$lib/server/db'
import { requireDeckOwnership } from '$lib/server/db/queries'
import { deck } from '$lib/server/db/schema'
import { eq } from 'drizzle-orm'
import type { RequestHandler } from './$types'

export const PUT: RequestHandler = async ({ request, params, platform, locals }) => {
	const { title } = (await request.json()) as { title: string }
	const userId = locals.user?.id

	if (!userId) {
		return json({ error: 'unauthorized' }, { status: 401 })
	}

	if (!title || typeof title !== 'string' || title.trim().length === 0) {
		return json({ error: 'title is required' }, { status: 400 })
	}

	const db = getDb(platform!.env.DB)

	const ownership = await requireDeckOwnership(db, params.id, userId, 'edit')
	if (!ownership.ok) {
		return ownership.error
	}

	const [updated] = await db.update(deck).set({ title }).where(eq(deck.id, params.id)).returning()

	return json({ deck: updated })
}

export const DELETE: RequestHandler = async ({ params, platform, locals }) => {
	const userId = locals.user?.id

	if (!userId) {
		return json({ error: 'unauthorized' }, { status: 401 })
	}

	const db = getDb(platform!.env.DB)

	const ownership = await requireDeckOwnership(db, params.id, userId, 'delete')
	if (!ownership.ok) {
		return ownership.error
	}

	await db.delete(deck).where(eq(deck.id, params.id))

	return json({ success: true })
}
