import { page } from 'vitest/browser'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { render } from 'vitest-browser-svelte'
import AppControls from './AppControls.svelte'

describe('AppControls.svelte', () => {
	afterEach(() => {
		localStorage.removeItem('tantore-theme')
		vi.restoreAllMocks()
	})

	it('reflects the stored theme after mounting', async () => {
		localStorage.setItem('tantore-theme', 'dark')
		render(AppControls)

		await expect.element(page.getByRole('switch', { name: 'Theme: Dark' })).toHaveClass('on')
	})

	it('reflects a dark system theme when no theme is stored', async () => {
		localStorage.removeItem('tantore-theme')
		vi.spyOn(window, 'matchMedia').mockReturnValue({
			matches: true,
			addEventListener: vi.fn(),
			removeEventListener: vi.fn(),
		} as unknown as MediaQueryList)
		render(AppControls)

		const themeSwitch = page.getByRole('switch', { name: 'Theme: Dark' })
		await expect.element(themeSwitch).toHaveClass('on')
		await themeSwitch.click()
		await expect.element(page.getByRole('switch', { name: 'Theme: Light' })).not.toHaveClass('on')
	})
})
