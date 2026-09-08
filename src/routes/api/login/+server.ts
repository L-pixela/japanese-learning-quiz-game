import { json } from '@sveltejs/kit'
import { scrypt } from 'node:crypto'
import { promisify } from 'node:util'
import { getDb } from '$lib/server/db'
import { user, session } from '$lib/server/db/schema'
import { eq } from 'drizzle-orm'
import type { RequestHandler } from './$types'

const scryptAsync = promisify(scrypt)

async function verifyPassword(password: string, hash: string): Promise<boolean> {
	const [salt, key] = hash.split(':')
	if (!salt || !key) return false

	const derivedKey = (await scryptAsync(password, salt, 64)) as Buffer
	return derivedKey.toString('hex') === key
}

export const POST: RequestHandler = async ({ request, platform, cookies }) => {
	const { username, password } = (await request.json()) as { username?: string; password?: string }

	if (!username || !password) {
		return json({ error: 'username and password are required' }, { status: 400 })
	}

	const db = getDb(platform!.env.DB)

	const existing = await db.select().from(user).where(eq(user.username, username)).limit(1)

	if (existing.length === 0) {
		return json({ error: 'invalid credentials' }, { status: 401 })
	}

	const isValid = await verifyPassword(password, existing[0].passwordHash)

	if (!isValid) {
		return json({ error: 'invalid credentials' }, { status: 401 })
	}

	// Create session
	const sessionId = crypto.randomUUID()
	// Session expires in 30 days
	const expiresAt = new Date()
	expiresAt.setDate(expiresAt.getDate() + 30)

	await db.insert(session).values({
		id: sessionId,
		userId: existing[0].id,
		expiresAt,
	})

	// Set cookie
	cookies.set('session', sessionId, {
		path: '/',
		httpOnly: true,
		sameSite: 'lax',
		expires: expiresAt,
		secure: !import.meta.env.DEV,
	})

	return json({ user: { id: existing[0].id, username: existing[0].username } }, { status: 200 })
}
