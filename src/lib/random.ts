const UINT32_RANGE = 2 ** 32

/** A crypto-backed fraction in [0, 1), usable in the browser and on the server. */
export function secureRandom(): number {
	return crypto.getRandomValues(new Uint32Array(1))[0] / UINT32_RANGE
}

/** Uniform integer in [0, maxExclusive); rejection sampling avoids modulo bias. */
export function secureRandomInt(maxExclusive: number): number {
	if (!Number.isInteger(maxExclusive) || maxExclusive < 1 || maxExclusive > UINT32_RANGE) {
		throw new RangeError('maxExclusive must be an integer from 1 through 2 ** 32')
	}
	const limit = UINT32_RANGE - (UINT32_RANGE % maxExclusive)
	const values = new Uint32Array(1)
	do crypto.getRandomValues(values)
	while (values[0] >= limit)
	return values[0] % maxExclusive
}
