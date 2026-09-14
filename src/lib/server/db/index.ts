import { error } from '@sveltejs/kit'
import { drizzle } from 'drizzle-orm/d1'
import * as schema from './schema'

export const getDb = (d1: D1Database) => drizzle(d1, { schema })

export const requireDb = (platform: App.Platform | undefined): D1Database => {
	if (!platform?.env?.DB) error(500, 'Service unavailable')
	return platform.env.DB
}
