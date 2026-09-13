import { readFileSync, mkdirSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { createHash } from 'node:crypto'
import { spawnSync } from 'node:child_process'
import { resolve } from 'node:path'

const root = fileURLToPath(new URL('../', import.meta.url))
const args = process.argv.slice(2)
if (
	args.some((arg) => !['--local', '--remote', '--dry-run'].includes(arg)) ||
	(args.includes('--local') && args.includes('--remote'))
) {
	throw new Error('Usage: node scripts/seed-words.ts [--local | --remote] [--dry-run]')
}
const words = JSON.parse(
	readFileSync(new URL('./data/words.json', import.meta.url), 'utf8'),
) as Array<{ japanese: string; reading: string; meaning: string; level: number; jlpt: string }>
const keys = new Set<string>()
for (const word of words) {
	const key = word.japanese + ':' + word.reading
	if (
		keys.has(key) ||
		!word.japanese.trim() ||
		!word.reading.trim() ||
		!word.meaning.trim() ||
		!Number.isInteger(word.level) ||
		word.level < 1 ||
		word.level > 10
	)
		throw new Error('Invalid or duplicate word: ' + key)
	keys.add(key)
}
for (let level = 1; level <= 10; level++) {
	const count = words.filter((word) => word.level === level).length
	if (count < 50 || count > 60) throw new Error('Level ' + level + ' must contain 50–60 words')
}
const quote = (value: string) => "'" + value.replaceAll("'", "''") + "'"
const sql = words
	.map((word) => {
		const id =
			'tantore-' +
			createHash('sha256')
				.update(word.japanese + ':' + word.reading)
				.digest('hex')
				.slice(0, 24)
		// Existing team vocabulary is preserved. Stable IDs make reseeding safe.
		return `INSERT INTO word (id, japanese, reading, meaning, level) SELECT ${quote(id)}, ${quote(word.japanese)}, ${quote(word.reading)}, ${quote(word.meaning)}, ${word.level} WHERE NOT EXISTS (SELECT 1 FROM word WHERE japanese = ${quote(word.japanese)} AND reading = ${quote(word.reading)}) ON CONFLICT(id) DO NOTHING;`
	})
	.join('\n')
const output = resolve(root, '.wrangler/seed-words.sql')
mkdirSync(resolve(root, '.wrangler'), { recursive: true })
writeFileSync(output, sql + '\n', 'utf8')
console.log('Validated ' + words.length + ' words: 55 per level. SQL: ' + output)
if (!args.includes('--dry-run')) {
	const wrangler = resolve(root, 'node_modules/wrangler/bin/wrangler.js')
	const run = spawnSync(
		process.execPath,
		[
			wrangler,
			'd1',
			'execute',
			'jpquizgame-db',
			args.includes('--remote') ? '--remote' : '--local',
			'--file',
			output,
		],
		{ cwd: root, stdio: 'inherit' },
	)
	if (run.error) throw run.error
	process.exitCode = run.status ?? 1
}
