/**
 * Light / dark / system.
 *
 * 'system' stamps nothing on <html> and lets the prefers-color-scheme block in
 * design-system.css decide; an explicit choice stamps data-theme so it wins in
 * both directions. The inline script in app.html applies the stored choice
 * before first paint, so there is no flash of the wrong theme.
 */
export type Theme = 'light' | 'dark' | 'system'

export const THEMES: Theme[] = ['light', 'dark', 'system']

const STORAGE_KEY = 'tantore-theme'

class ThemeStore {
	current = $state<Theme>('system')

	hydrate() {
		if (typeof localStorage === 'undefined') return
		const stored = localStorage.getItem(STORAGE_KEY)
		this.current = stored === 'light' || stored === 'dark' ? stored : 'system'
	}

	set(theme: Theme) {
		this.current = theme
		if (typeof localStorage !== 'undefined') localStorage.setItem(STORAGE_KEY, theme)
		if (typeof document === 'undefined') return
		if (theme === 'system') document.documentElement.removeAttribute('data-theme')
		else document.documentElement.setAttribute('data-theme', theme)
	}

	/** The next theme in the cycle, for a single toggle button. */
	next(): Theme {
		return THEMES[(THEMES.indexOf(this.current) + 1) % THEMES.length]
	}
}

export const theme = new ThemeStore()
