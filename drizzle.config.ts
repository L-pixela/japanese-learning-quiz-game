import { defineConfig } from 'drizzle-kit'

// Only `db:push` and `db:studio` reach the remote D1 over the HTTP API.
// `db:generate` just reads the schema, so it must not require credentials —
// migrations are applied with `db:migrate` / `db:migrate:remote` (wrangler).
const needsCredentials = process.argv.some((arg) => arg === 'push' || arg === 'studio')

if (needsCredentials) {
	if (!process.env.CLOUDFLARE_ACCOUNT_ID) throw new Error('CLOUDFLARE_ACCOUNT_ID is not set')
	if (!process.env.CLOUDFLARE_DATABASE_ID) throw new Error('CLOUDFLARE_DATABASE_ID is not set')
	if (!process.env.CLOUDFLARE_D1_TOKEN) throw new Error('CLOUDFLARE_D1_TOKEN is not set')
}

export default defineConfig({
	schema: './src/lib/server/db/schema.ts',
	dialect: 'sqlite',
	driver: 'd1-http',
	dbCredentials: {
		accountId: process.env.CLOUDFLARE_ACCOUNT_ID ?? '',
		databaseId: process.env.CLOUDFLARE_DATABASE_ID ?? '',
		token: process.env.CLOUDFLARE_D1_TOKEN ?? '',
	},
	verbose: true,
	strict: true,
})
