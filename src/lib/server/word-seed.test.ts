import { expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
it('ships 55 unique, complete vocabulary entries per level in the expected JLPT bands', () => {
	const rows = JSON.parse(readFileSync('scripts/data/words.json', 'utf8')) as Array<{
		japanese: string
		reading: string
		meaning: string
		level: number
		jlpt: string
	}>
	expect(rows).toHaveLength(550)
	expect(new Set(rows.map((r) => r.japanese + ':' + r.reading)).size).toBe(550)
	expect(rows.every((r) => /^[\u3040-\u30ffー\s]+$/.test(r.reading))).toBe(true)
	for (let level = 1; level <= 10; level++) {
		const words = rows.filter((r) => r.level === level)
		expect(words).toHaveLength(55)
		expect(
			words.every(
				(r) =>
					r.japanese.trim() &&
					r.reading.trim() &&
					r.meaning.trim() &&
					r.jlpt === (level <= 5 ? 'N4' : 'N3'),
			),
		).toBe(true)
	}
})
