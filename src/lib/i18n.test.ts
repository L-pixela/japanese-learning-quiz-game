import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { i18n, LANGUAGES, t } from './i18n.svelte'

describe('i18n store', () => {
	let localStorageMock: { getItem: ReturnType<typeof vi.fn>; setItem: ReturnType<typeof vi.fn> }
	let documentMock: { documentElement: { lang: string } }

	beforeEach(() => {
		localStorageMock = { getItem: vi.fn(), setItem: vi.fn() }
		documentMock = { documentElement: { lang: '' } }
		vi.stubGlobal('localStorage', localStorageMock)
		vi.stubGlobal('document', documentMock)
	})

	afterEach(() => {
		vi.unstubAllGlobals()
		i18n.current = 'en'
	})

	it('hydrate() falls back to en when localStorage is undefined', () => {
		vi.stubGlobal('localStorage', undefined)
		i18n.hydrate()
		expect(i18n.current).toBe('en')
	})

	it('hydrate() reads a valid stored language and stamps <html lang>', () => {
		localStorageMock.getItem.mockReturnValue('ja')
		i18n.hydrate()
		expect(i18n.current).toBe('ja')
		expect(documentMock.documentElement.lang).toBe('ja')
	})

	it('hydrate() falls back to en for an invalid stored value', () => {
		localStorageMock.getItem.mockReturnValue('fr')
		i18n.hydrate()
		expect(i18n.current).toBe('en')
	})

	it('set() updates current, persists it, and stamps <html lang>', () => {
		i18n.set('ja')
		expect(i18n.current).toBe('ja')
		expect(localStorageMock.setItem).toHaveBeenCalledWith('tantore-lang', 'ja')
		expect(documentMock.documentElement.lang).toBe('ja')
	})

	it('set() does not throw when localStorage is undefined', () => {
		vi.stubGlobal('localStorage', undefined)
		expect(() => i18n.set('ja')).not.toThrow()
		expect(i18n.current).toBe('ja')
	})

	it('set() does not throw when document is undefined', () => {
		vi.stubGlobal('document', undefined)
		expect(() => i18n.set('ja')).not.toThrow()
		expect(i18n.current).toBe('ja')
	})

	it('t() returns the English string by default', () => {
		expect(t('nav.quiz')).toBe('Quiz')
	})

	it('t() returns the Japanese string when current is ja', () => {
		i18n.current = 'ja'
		expect(t('nav.quiz')).toBe('クイズ')
	})

	it('t() substitutes placeholders from values', () => {
		expect(t('dashboard.welcome', { name: 'Alice' })).toBe('Welcome back, Alice.')
	})

	it('t() leaves an unmatched placeholder untouched', () => {
		expect(t('dashboard.welcome', {})).toBe('Welcome back, {name}.')
	})

	it('exposes the expected LANGUAGES', () => {
		expect(LANGUAGES.map((l) => l.code)).toEqual(['en', 'ja'])
	})
})
