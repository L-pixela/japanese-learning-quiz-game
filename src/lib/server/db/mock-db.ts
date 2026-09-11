/* eslint-disable @typescript-eslint/no-explicit-any */
import { vi } from 'vitest'

export function mockSelect(rows: any[]) {
	return {
		select: vi.fn().mockReturnValue({
			from: vi.fn().mockReturnValue({
				where: vi.fn().mockReturnValue({
					limit: vi.fn().mockResolvedValue(rows),
				}),
			}),
		}),
	}
}

type Selection = { rows: any[]; ordered?: boolean }

export function mockSelectSequence(selections: Selection[]) {
	const limits = selections.map((selection) => vi.fn().mockResolvedValue(selection.rows))
	const select = vi.fn()

	selections.forEach((selection, index) => {
		const tail = selection.ordered
			? { orderBy: vi.fn().mockReturnValue({ limit: limits[index] }) }
			: { limit: limits[index] }

		select.mockReturnValueOnce({
			from: vi.fn().mockReturnValue({
				where: vi.fn().mockReturnValue(tail),
			}),
		})
	})

	return { select, limits }
}

export function mockJoinedSelect(rows: any[]) {
	return {
		select: vi.fn().mockReturnValue({
			from: vi.fn().mockReturnValue({
				innerJoin: vi.fn().mockReturnValue({
					where: vi.fn().mockReturnValue({
						limit: vi.fn().mockResolvedValue(rows),
					}),
				}),
			}),
		}),
	}
}
