<script lang="ts">
	import { onMount } from 'svelte'
	import { i18n, t } from '$lib/i18n.svelte'
	import { theme } from '$lib/theme.svelte'

	// Both preferences live in localStorage, so they can only be read once the
	// component is in the browser.
	onMount(() => {
		i18n.hydrate()
		theme.hydrate()
	})

	let isJa = $derived(i18n.current === 'ja')
	let isDark = $derived(theme.current === 'dark')

	function toggleLang() {
		i18n.set(isJa ? 'en' : 'ja')
	}
	function toggleTheme() {
		theme.set(isDark ? 'light' : 'dark')
	}
</script>

<div class="app-controls">
	<!-- Two-position switches: the thumb slides, the track never wraps. -->
	<button
		type="button"
		class="switch lang"
		class:on={isJa}
		role="switch"
		aria-checked={isJa}
		aria-label={t('nav.language')}
		title={t('nav.language')}
		onclick={toggleLang}
	>
		<span class="thumb" aria-hidden="true"></span>
		<span class="face face-a" aria-hidden="true">EN</span>
		<span class="face face-b" aria-hidden="true">日本語</span>
	</button>

	<button
		type="button"
		class="switch theme"
		class:on={isDark}
		role="switch"
		aria-checked={isDark}
		aria-label={t('nav.theme') + ': ' + t(isDark ? 'theme.dark' : 'theme.light')}
		title={t('nav.theme')}
		onclick={toggleTheme}
	>
		<span class="thumb" aria-hidden="true"></span>
		<span class="face face-a" aria-hidden="true">☀</span>
		<span class="face face-b" aria-hidden="true">☾</span>
	</button>
</div>

<style>
	.app-controls {
		display: flex;
		align-items: center;
		gap: var(--spacing-sm);
		flex-shrink: 0;
	}
	.switch {
		position: relative;
		display: grid;
		grid-auto-flow: column;
		align-items: center;
		padding: 4px;
		border: 0;
		border-radius: var(--radius-full);
		background: var(--color-surface-sunken);
		box-shadow: inset 0 0 0 1px var(--color-border);
		font: inherit;
		cursor: pointer;
		white-space: nowrap;
		user-select: none;
	}
	.lang {
		grid-template-columns: 48px 62px;
	}
	.theme {
		grid-template-columns: 40px 40px;
	}
	.face {
		position: relative;
		z-index: 1;
		color: var(--color-text-secondary);
		font-size: var(--text-sm);
		font-weight: var(--font-weight-bold);
		line-height: 32px;
		text-align: center;
		transition: color var(--duration-base) var(--ease-standard);
	}
	/* Whichever side the thumb covers gets the on-primary ink. The other side
	   stays muted. (The thumb is itself a span, so :first-of-type would match
	   the thumb, not the label — hence the explicit classes.) */
	.switch:not(.on) .face-a,
	.switch.on .face-b {
		color: var(--color-on-primary);
	}
	.thumb {
		position: absolute;
		top: 4px;
		left: 4px;
		bottom: 4px;
		width: calc(50% - 4px);
		border-radius: var(--radius-full);
		background: var(--color-primary);
		transition: transform var(--duration-base) var(--ease-standard);
	}
	.lang .thumb {
		width: 48px;
	}
	.lang.on .thumb {
		width: 62px;
		transform: translateX(48px);
	}
	.theme .thumb {
		width: 40px;
	}
	.theme.on .thumb {
		transform: translateX(40px);
	}
	.switch:focus-visible {
		outline: 3px solid var(--color-focus-ring);
		outline-offset: 3px;
	}
	@media (prefers-reduced-motion: reduce) {
		.thumb,
		.face {
			transition: none;
		}
	}
</style>
