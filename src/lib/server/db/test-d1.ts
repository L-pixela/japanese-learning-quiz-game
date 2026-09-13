import { DatabaseSync, type SQLInputValue } from 'node:sqlite'
import { readFileSync, readdirSync } from 'node:fs'
import { resolve } from 'node:path'

// Real SQLite queries behind D1's small prepared-statement interface.
// Used for transactional progress and route integration tests.
export function createTestD1() {
	const sqlite = new DatabaseSync(':memory:')
	sqlite.exec('PRAGMA foreign_keys = ON')
	for (const migration of readdirSync(resolve('drizzle'))
		.filter((name) => name.endsWith('.sql'))
		.sort()) {
		sqlite.exec(readFileSync(resolve('drizzle', migration), 'utf8'))
	}
	const prepare = (query: string, values: SQLInputValue[] = []) => ({
		bind: (...bindings: SQLInputValue[]) => prepare(query, bindings),
		async raw() {
			return sqlite
				.prepare(query)
				.all(...values)
				.map((row) => Object.values(row))
		},
		async all() {
			return { success: true, results: sqlite.prepare(query).all(...values), meta: {} }
		},
		async first() {
			return sqlite.prepare(query).get(...values) ?? null
		},
		async run() {
			const result = sqlite.prepare(query).run(...values)
			return { success: true, results: [], meta: { changes: Number(result.changes) } }
		},
	})
	const d1 = {
		prepare,
		async batch(statements: Array<ReturnType<typeof prepare>>) {
			sqlite.exec('BEGIN')
			try {
				const results = []
				for (const statement of statements) results.push(await statement.all())
				sqlite.exec('COMMIT')
				return results
			} catch (error) {
				sqlite.exec('ROLLBACK')
				throw error
			}
		},
	} as unknown as D1Database
	return { d1, sqlite }
}
