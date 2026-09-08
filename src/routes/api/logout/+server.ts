import { json } from '@sveltejs/kit'
import { getDb } from '$lib/server/db'
import { session } from '$lib/server/db/schema'
import { eq } from 'drizzle-orm'
import type { RequestHandler } from './$types'

export const POST: RequestHandler = async ({ locals, cookies, platform }) => {
	if (!locals.session) {
		return json({ error: 'unauthorized' }, { status: 401 })
	}

	const db = getDb(platform!.env.DB)

	await db.delete(session).where(eq(session.id, locals.session.id))

	cookies.delete('session', { path: '/' })

	return json({ success: true }, { status: 200 })
}
