import { defineConfig } from 'drizzle-kit'

// SQL generation is local. Remote studio/push require credentials.
export default defineConfig({
	schema: './src/lib/server/db/schema.ts',
	dialect: 'sqlite',
	...(process.env.CLOUDFLARE_D1_TOKEN
		? {
				driver: 'd1-http' as const,
				dbCredentials: {
					accountId: process.env.CLOUDFLARE_ACCOUNT_ID!,
					databaseId: process.env.CLOUDFLARE_DATABASE_ID!,
					token: process.env.CLOUDFLARE_D1_TOKEN,
				},
			}
		: {}),
	verbose: true,
	strict: true,
})
