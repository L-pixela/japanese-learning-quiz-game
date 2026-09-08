import { getDb } from '$lib/server/db'
import { session, user } from '$lib/server/db/schema'
import { eq } from 'drizzle-orm'
import type { Handle } from '@sveltejs/kit'

export const handle: Handle = async ({ event, resolve }) => {
	const sessionId = event.cookies.get('session')

	if (!sessionId) {
		event.locals.user = null
		event.locals.session = null
		return resolve(event)
	}

	const db = getDb(event.platform!.env.DB)

	const sessions = await db
		.select({
			session: session,
			user: {
				id: user.id,
				username: user.username,
			}
		})
		.from(session)
		.innerJoin(user, eq(session.userId, user.id))
		.where(eq(session.id, sessionId))
		.limit(1)

	if (sessions.length === 0) {
		event.cookies.delete('session', { path: '/' })
		event.locals.user = null
		event.locals.session = null
		return resolve(event)
	}

	const activeSession = sessions[0]

	// Check if session has expired
	if (new Date() >= activeSession.session.expiresAt) {
		await db.delete(session).where(eq(session.id, sessionId))
		event.cookies.delete('session', { path: '/' })
		event.locals.user = null
		event.locals.session = null
		return resolve(event)
	}

	// Session is valid
	event.locals.user = activeSession.user
	event.locals.session = activeSession.session

	return resolve(event)
}
