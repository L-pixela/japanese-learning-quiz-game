/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect } from 'vitest'
import { requireDeckOwnership } from './queries'
import { mockSelect } from './mock-db'

describe('requireDeckOwnership', () => {
	it('returns a 404 error when the deck does not exist', async () => {
		const db = mockSelect([]) as any

		const result = await requireDeckOwnership(db, 'd1', 'u1', 'edit')

		expect(result.ok).toBe(false)
		if (!result.ok) {
			expect(result.error.status).toBe(404)
			expect(await result.error.json()).toEqual({ error: 'deck not found' })
		}
	})

	it('returns a 403 error when the deck belongs to another user', async () => {
		const db = mockSelect([{ id: 'd1', userId: 'u2' }]) as any

		const result = await requireDeckOwnership(db, 'd1', 'u1', 'edit')

		expect(result.ok).toBe(false)
		if (!result.ok) {
			expect(result.error.status).toBe(403)
			expect(await result.error.json()).toEqual({ error: 'not authorized to edit this deck' })
		}
	})

	it('returns ok when the deck exists and belongs to the user', async () => {
		const db = mockSelect([{ id: 'd1', userId: 'u1' }]) as any

		const result = await requireDeckOwnership(db, 'd1', 'u1', 'edit')

		expect(result).toEqual({ ok: true })
	})
})
