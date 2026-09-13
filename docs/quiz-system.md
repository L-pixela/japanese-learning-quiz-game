# TanTore quiz flow

## Local setup

From the application directory (Node 24 is used for the TypeScript seed and SQLite tests):

```sh
npm run db:migrate
npm run db:seed
npm run dev
```

The new migration is `drizzle/0005_freezing_sunspot.sql`. It adds nullable university, per-user level progress, and server-held quiz attempts. Existing decks, cards, points and users are preserved. SQL generation no longer requires Cloudflare credentials; remote studio/push still do.

These commands target **local D1**. Remote deployment needs the same migration and seed applied explicitly with `npm run db:migrate:remote` and `npm run db:seed -- --remote` before deploying the new application. No remote database was modified during implementation.

## Screens

- `/dashboard`: live points, streak, stored rank, global leaderboard position, and quiz CTA.
- `/quiz`: ten open levels with persistent gray/yellow/green progress.
- `/quiz/[level]`: ten random words, four meaning choices, back/next, and submit.
- `/quiz/quiz-results?attempt=<id>`: saved score, pass/fail, points and completion statistics.
- `/team`: team credits and anime portrait placeholders.
- `/deck_list`: existing deck feature, linked as secondary navigation.

Names, roles and portrait paths live in `src/lib/team.ts`. Put artwork in `static/team/`, then replace the corresponding null image with a path such as `/team/bunleap.webp`. All six team members have portrait placeholders ready for artwork.

## API contract

All level and quiz endpoints use the existing session cookie and `locals.user`.

- `GET /api/levels` returns `{ levels: [{ level, name, japanese, description, difficulty, status, bestScore, attempts, updatedAt }] }`. Missing progress becomes not_started.
- `POST /api/quiz/start` accepts `{ level: 1 }`; returns `{ attemptId, level, questions: [{ japanese, reading, options }] }`. Correct answers stay in the database.
- `POST /api/quiz/submit` accepts `{ attemptId, answers: [0, 1, ...] }` with exactly ten indices (0–3). It no longer accepts a client-calculated score or target user ID. No deck/card route was changed.
- Submission returns score (0–10), totalCount, passed, pointsEarned, level, difficulty, user totals and `completion: { completedUsers, totalUsers, percentage }`.
- `GET /api/leaderboard?withPosition=true` optionally includes the viewer's global position, even outside the selected page. Default response remains compatible. Ties use points, streak, creation time, then user ID consistently.
- Registration accepts optional university (trimmed, up to 200 characters), also returned by `GET /api/me`.

One point per correct answer; six correct answers pass. Best score never decreases, attempts count submitted quizzes, and completed levels never downgrade. D1 transactional batches guard against repeated/concurrent awarding. Results survive refresh and belong only to the signed-in learner. Streaks use UTC calendar days, with same-day repeats unchanged and missed days resetting the streak.

Completion statistics divide distinct completed learners by all registered users; each learner contributes once per level. The unique progress key makes COUNT(*) equivalent to distinct user count here.

## Vocabulary and validation

See `scripts/data/README.md` for source, license, editorial grouping and reproducibility. The checked-in seed contains 550 words, 55 per level. Existing vocabulary pairs are skipped instead of overwritten.

Server integration tests run generated migrations against real SQLite and cover score boundaries, invalid input, ownership, replay protection, rollback, constraints, streak dates, aggregate statistics and ranking outside the first page. Dashboard browser tests use supplied server data rather than mock decks.

```sh
npm run check
npm run test:unit -- --run
npm run build
```

On Windows hosts reserving Vitest's default port 63315, set `test.projects[0].test.browser.api` to an available local port/host in a local test config. The implementation was also checked in Chromium at desktop and 390px phone widths against local D1: registration, university persistence, login, level selection, all ten answers, saved results, replay protection, team credits and deck access.
