import { afterEach, describe, expect, it, vi } from 'vitest'
import { secureRandom, secureRandomInt } from './random'

afterEach(() => vi.restoreAllMocks())

function samples(...values: number[]) {
	return vi.spyOn(crypto, 'getRandomValues').mockImplementation((array) => {
		;(array as Uint32Array)[0] = values.shift()!
		return array
	})
}

describe('crypto randomness', () => {
	it('returns fractions including zero but excluding one', () => {
		samples(0, 2 ** 31, 2 ** 32 - 1)
		expect(secureRandom()).toBe(0)
		expect(secureRandom()).toBe(0.5)
		expect(secureRandom()).toBe(1 - 1 / 2 ** 32)
	})
	it('rejects the biased tail before selecting an integer', () => {
		const random = samples(2 ** 32 - 1, 2 ** 32 - 6, 19)
		expect(secureRandomInt(10)).toBe(9)
		expect(random).toHaveBeenCalledTimes(3)
	})
	it('supports both ends of the allowed range', () => {
		samples(2 ** 32 - 1, 2 ** 32 - 1, 0)
		expect(secureRandomInt(1)).toBe(0)
		expect(secureRandomInt(2 ** 32)).toBe(2 ** 32 - 1)
		expect(secureRandomInt(10)).toBe(0)
	})
	it.each([0, -1, 1.5, NaN, Infinity, 2 ** 32 + 1])('rejects invalid bound %s', (bound) => {
		const random = samples(0)
		expect(() => secureRandomInt(bound)).toThrow(RangeError)
		expect(random).not.toHaveBeenCalled()
	})
})
