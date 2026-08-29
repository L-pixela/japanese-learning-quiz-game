# Japanese Learning Quiz Game

A quiz game for practising Japanese, built with SvelteKit and deployed to Cloudflare Workers with
a D1 database.

> **Status:** project scaffold. The Cloudflare/D1 infrastructure is set up and working end to end;
> the quiz features themselves have not been built yet. `src/lib/vitest-examples/` and
> `src/routes/demo/` are template examples and can be deleted once real code replaces them.

## Stack

| Layer     | Choice                                                                                             |
| --------- | -------------------------------------------------------------------------------------------------- |
| Framework | [SvelteKit](https://svelte.dev/docs/kit) 2 with Svelte 5 (runes mode)                              |
| Styling   | [Tailwind CSS](https://tailwindcss.com) 4                                                          |
| Database  | [Cloudflare D1](https://developers.cloudflare.com/d1/) via [Drizzle ORM](https://orm.drizzle.team) |
| Hosting   | [Cloudflare Workers](https://developers.cloudflare.com/workers/) with static assets                |
| Testing   | [Vitest](https://vitest.dev) (unit + component), [Playwright](https://playwright.dev) (e2e)        |
| Tooling   | TypeScript, ESLint, Prettier                                                                       |

## Prerequisites

- **Node.js 24+** and npm 11+ (developed on Node 24.19, npm 11.17)
- A **Cloudflare account** — free tier is enough

## Setup

### 1. Install dependencies

```sh
npm install
```

### 2. Create the D1 database

```sh
npx wrangler login
npx wrangler d1 create jpquizgame-db
```

Copy the `database_id` from the output into `database_id` in [`wrangler.jsonc`](./wrangler.jsonc),
replacing `REPLACE_WITH_YOUR_D1_DATABASE_ID`.

> Local development works with the placeholder still in place — the ID is only needed to reach the
> remote database.

### 3. Configure environment variables

```sh
cp .env.example .env
```

Fill in all three values:

| Variable                 | Where to find it                                                            |
| ------------------------ | --------------------------------------------------------------------------- |
| `CLOUDFLARE_ACCOUNT_ID`  | Cloudflare dashboard → Workers & Pages → Account ID                         |
| `CLOUDFLARE_DATABASE_ID` | the same `database_id` from step 2                                          |
| `CLOUDFLARE_D1_TOKEN`    | dashboard → My Profile → API Tokens → Create Token, scoped to **D1 : Edit** |

These are only used by `db:push` and `db:studio`, which talk to the remote D1 over its HTTP API.
Everything else authenticates through `wrangler login`.

`.env` is gitignored — never commit it, and keep secrets out of the `vars` block in
`wrangler.jsonc`, which _is_ committed.

### 4. Generate types and set up the database

```sh
npm run gen           # writes worker-configuration.d.ts (Env + Workers runtime types)
npm run db:generate   # turns src/lib/server/db/schema.ts into SQL under drizzle/
npm run db:migrate    # applies it to your local D1
```

## Running the project

```sh
npm run dev           # http://localhost:5173
```

Cloudflare bindings are emulated by miniflare during `dev`, so `platform.env.DB` is a real local D1
whose data lives in `.wrangler/state`.

```sh
npm run dev -- --open # start and open a browser tab
npm run preview       # build, then serve the real Worker in workerd via wrangler dev
```

`preview` is the closest thing to production you can run locally — your code executes inside the
actual Workers runtime rather than Node.

## Working with the database

The schema in [`src/lib/server/db/schema.ts`](./src/lib/server/db/schema.ts) is the source of truth.
After editing it:

```sh
npm run db:generate       # write a new migration into drizzle/
npm run db:migrate        # apply to local D1
npm run db:migrate:remote # apply to the deployed D1, when you're ready
```

Access the database from server-side code through `platform.env.DB`:

```ts
// src/routes/api/tasks/+server.ts
import { json } from '@sveltejs/kit'
import { getDb } from '$lib/server/db'
import { task } from '$lib/server/db/schema'
import type { RequestHandler } from './$types'

export const GET: RequestHandler = async ({ platform }) => {
	const db = getDb(platform!.env.DB)
	return json(await db.select().from(task))
}
```

`platform` is only defined when the Cloudflare adapter is active — it is available in `dev`,
`preview`, and production, but you should still guard it if you want a clear error message.

Inspect data with `npx wrangler d1 execute jpquizgame-db --local --command "SELECT * FROM task"`,
or `npm run db:studio` for a GUI over the **remote** database.

> Prefer `db:generate` + `db:migrate*` over `db:push`. `db:push` writes schema changes directly
> without recording a migration, which desyncs D1's `d1_migrations` bookkeeping.

## Deploying

```sh
npm run db:migrate:remote   # make sure the remote schema is current first
npm run deploy
```

`deploy` builds and runs `wrangler deploy`, then prints your `*.workers.dev` URL.

## Scripts

| Script                      | What it does                                                           |
| --------------------------- | ---------------------------------------------------------------------- |
| `npm run dev`               | development server with emulated Cloudflare bindings                   |
| `npm run build`             | production build into `.svelte-kit/cloudflare/`                        |
| `npm run preview`           | build, then run the Worker locally in workerd                          |
| `npm run deploy`            | build and deploy to Cloudflare                                         |
| `npm run gen`               | regenerate `worker-configuration.d.ts` from `wrangler.jsonc`           |
| `npm run check`             | type-check with `svelte-check`                                         |
| `npm run check:watch`       | same, in watch mode                                                    |
| `npm run lint`              | Prettier + ESLint, check only                                          |
| `npm run format`            | rewrite files with Prettier                                            |
| `npm run test:unit`         | Vitest in watch mode                                                   |
| `npm run test:e2e`          | Playwright end-to-end tests                                            |
| `npm test`                  | unit tests once, then e2e                                              |
| `npm run db:generate`       | generate a migration from the schema                                   |
| `npm run db:migrate`        | apply migrations to the local D1                                       |
| `npm run db:migrate:remote` | apply migrations to the remote D1                                      |
| `npm run db:studio`         | Drizzle Studio against the remote D1                                   |
| `npm run db:push`           | push schema straight to remote, skipping migrations — see caveat above |

Run `npm run gen` again whenever you change bindings in `wrangler.jsonc`, and commit the resulting
`worker-configuration.d.ts` so type-checking works on a fresh clone.

## Project structure

```
src/
├── app.d.ts                  # App.Platform types — platform.env is typed here
├── app.html
├── lib/
│   ├── server/db/
│   │   ├── index.ts          # getDb(d1) — Drizzle client factory
│   │   └── schema.ts         # table definitions (source of truth)
│   └── vitest-examples/      # template examples, safe to delete
└── routes/
    ├── +layout.svelte
    ├── +page.svelte
    └── demo/                 # template examples, safe to delete

drizzle/                      # generated migrations — commit these
wrangler.jsonc                # Workers + D1 configuration
worker-configuration.d.ts     # generated by `npm run gen` — commit this
```

## Testing

```sh
npm run test:unit -- --run              # all unit + component tests, once
npm run test:unit -- --run --project server   # server-side tests only
npm run test:e2e                        # Playwright
```

Component and e2e tests need browsers installed. If you see
`browserType.launch: Executable doesn't exist`, run `npx playwright install`.

## Troubleshooting

**`Cannot find name 'D1Database'` or `Env`** — run `npm run gen`. The types come from the generated
`worker-configuration.d.ts`, not from a package.

**`CLOUDFLARE_ACCOUNT_ID is not set`** — only `db:push` and `db:studio` require `.env`; if you hit
this on another command, that command is reaching the remote database when you probably meant the
local one.

**`no such table: task`** — the local database has no schema yet. Run `npm run db:migrate`.

**Local database seems empty or stale** — `npm run dev` and the `wrangler d1` CLI share
`.wrangler/state`. Deleting that directory resets your local data; re-run `npm run db:migrate`
afterwards.
