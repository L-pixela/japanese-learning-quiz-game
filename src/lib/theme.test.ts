import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { theme, THEMES } from './theme.svelte'

describe('theme store', () => {
	let localStorageMock: { getItem: ReturnType<typeof vi.fn>; setItem: ReturnType<typeof vi.fn> }
	let documentMock: {
		documentElement: {
			setAttribute: ReturnType<typeof vi.fn>
			removeAttribute: ReturnType<typeof vi.fn>
		}
	}

	beforeEach(() => {
		localStorageMock = { getItem: vi.fn(), setItem: vi.fn() }
		documentMock = {
			documentElement: { setAttribute: vi.fn(), removeAttribute: vi.fn() },
		}
		vi.stubGlobal('localStorage', localStorageMock)
		vi.stubGlobal('document', documentMock)
	})

	afterEach(() => {
		vi.unstubAllGlobals()
		theme.current = 'system'
	})

	it('hydrate() is a no-op and leaves current as system when localStorage is undefined', () => {
		vi.stubGlobal('localStorage', undefined)
		theme.hydrate()
		expect(theme.current).toBe('system')
		expect(localStorageMock.getItem).not.toHaveBeenCalled()
	})

	it('hydrate() reads a valid stored value from localStorage', () => {
		localStorageMock.getItem.mockReturnValue('dark')
		theme.hydrate()
		expect(theme.current).toBe('dark')
		expect(localStorageMock.getItem).toHaveBeenCalledWith('tantore-theme')
	})

	it('hydrate() falls back to system when the stored value is invalid', () => {
		localStorageMock.getItem.mockReturnValue('purple')
		theme.hydrate()
		expect(theme.current).toBe('system')
	})

	it('set("dark") updates current, persists it, and stamps data-theme', () => {
		theme.set('dark')
		expect(theme.current).toBe('dark')
		expect(localStorageMock.setItem).toHaveBeenCalledWith('tantore-theme', 'dark')
		expect(documentMock.documentElement.setAttribute).toHaveBeenCalledWith('data-theme', 'dark')
		expect(documentMock.documentElement.removeAttribute).not.toHaveBeenCalled()
	})

	it('set("system") removes the data-theme attribute instead of setting it', () => {
		theme.set('system')
		expect(theme.current).toBe('system')
		expect(documentMock.documentElement.removeAttribute).toHaveBeenCalledWith('data-theme')
		expect(documentMock.documentElement.setAttribute).not.toHaveBeenCalled()
	})

	it.each([
		['light', 'dark'],
		['dark', 'system'],
		['system', 'light'],
	] as const)('next() cycles %s -> %s', (current, expected) => {
		theme.current = current
		expect(theme.next()).toBe(expected)
	})

	it('exposes the expected THEMES order', () => {
		expect(THEMES).toEqual(['light', 'dark', 'system'])
	})
})
