import { json } from '@sveltejs/kit'
import { scrypt, randomBytes } from 'node:crypto'
import { promisify } from 'node:util'
import { getDb } from '$lib/server/db'
import { user } from '$lib/server/db/schema'
import { eq } from 'drizzle-orm'
import type { RequestHandler } from './$types'

const scryptAsync = promisify(scrypt)

async function hashPassword(password: string): Promise<string> {
	const salt = randomBytes(16).toString('hex')
	const derivedKey = (await scryptAsync(password, salt, 64)) as Buffer
	return `${salt}:${derivedKey.toString('hex')}`
}

export const POST: RequestHandler = async ({ request, platform }) => {
	const { username, password } = (await request.json()) as { username: string; password: string }

	if (!username || !password) {
		return json({ error: 'username and password are required' }, { status: 400 })
	}

	if (typeof username !== 'string' || username.length < 3) {
		return json({ error: 'username must be at least 3 characters' }, { status: 400 })
	}

	if (typeof password !== 'string' || password.length < 8) {
		return json({ error: 'password must be at least 8 characters' }, { status: 400 })
	}

	const db = getDb(platform!.env.DB)

	const existing = await db.select().from(user).where(eq(user.username, username)).limit(1)

	if (existing.length > 0) {
		return json({ error: 'username already taken' }, { status: 409 })
	}

	const passwordHash = await hashPassword(password)

	const [newUser] = await db
		.insert(user)
		.values({
			username,
			passwordHash,
		})
		.returning({ id: user.id, username: user.username })

	return json({ user: newUser }, { status: 201 })
}
