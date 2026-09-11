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
