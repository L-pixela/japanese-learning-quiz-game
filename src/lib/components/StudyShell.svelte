<script lang="ts">
	import { page } from '$app/state'
	import { goto } from '$app/navigation'
	import { resolve } from '$app/paths'
	import type { Snippet } from 'svelte'
	import '$lib/styles/study.css'
	import AppControls from './AppControls.svelte'
	import { t } from '$lib/i18n.svelte'
	let { children, confirmNavigation = false }: { children: Snippet; confirmNavigation?: boolean } =
		$props()
	let isMenuOpen = $state(false)
	let pendingNavigation = $state<string | null>(null)
	// Each destination carries a glyph for the rail, drawn as a single stroked
	// path on a 24x24 grid so they share one optical weight.
	const links = [
		{ href: '/dashboard', key: 'nav.overview', icon: 'M3 10.5 12 3l9 7.5M5.5 9.5V20h13V9.5' },
		{
			href: '/quiz',
			key: 'nav.quiz',
			icon: 'M12 3.5a8.5 8.5 0 1 0 0 17 8.5 8.5 0 0 0 0-17Zm0 4.3a4.2 4.2 0 1 0 0 8.4 4.2 4.2 0 0 0 0-8.4Z',
		},
		{
			href: '/team',
			key: 'nav.team',
			icon: 'M9 11a3.2 3.2 0 1 0 0-6.4A3.2 3.2 0 0 0 9 11Zm7 .4a2.7 2.7 0 1 0 0-5.4 2.7 2.7 0 0 0 0 5.4ZM2.5 19.2c0-3 2.9-4.8 6.5-4.8s6.5 1.8 6.5 4.8M17 14.6c2.6.3 4.5 1.8 4.5 4.6',
		},
		{
			href: '/profile',
			key: 'nav.profile',
			icon: 'M12 11.4a3.7 3.7 0 1 0 0-7.4 3.7 3.7 0 0 0 0 7.4ZM4.8 20c0-3.6 3.2-5.8 7.2-5.8s7.2 2.2 7.2 5.8',
		},
	] as const

	function navigate(event: MouseEvent, href: string) {
		if (!confirmNavigation) return
		event.preventDefault()
		pendingNavigation = href
		isMenuOpen = false
	}

	async function confirmPendingNavigation() {
		if (!pendingNavigation) return
		const href = pendingNavigation
		pendingNavigation = null
		await goto(href)
	}
</script>

<div class="study-app">
	<header class="study-nav">
		<a
			class="study-brand"
			href={resolve('/dashboard', {})}
			onclick={(event) => navigate(event, resolve('/dashboard', {}))}
			><span class="study-seal" lang="ja">単</span><span
				>TanTore<small>{t('nav.brandTagline')}</small></span
			></a
		>
		<nav id="study-nav-links" class:open={isMenuOpen} aria-label={t('a11y.mainNav')}>
			{#each links as link (link.href)}
				<a
					href={resolve(link.href, {})}
					aria-current={page.url.pathname.startsWith(link.href) ? 'page' : undefined}
					onclick={(event) => navigate(event, resolve(link.href, {}))}>{t(link.key)}</a
				>
			{/each}
		</nav>
		<AppControls />
		<button
			type="button"
			class="study-nav-toggle"
			aria-expanded={isMenuOpen}
			aria-controls="study-nav-links"
			aria-label={t('nav.menu')}
			onclick={() => (isMenuOpen = !isMenuOpen)}
		>
			{isMenuOpen ? '✕' : '☰'}
		</button>
	</header>
	<main class="study-main">{@render children()}</main>
	<footer class="study-footer">
		<span>TanTore <span lang="ja">・ 一日一歩</span></span><span>{t('footer.tagline')}</span><a
			href={resolve('/team', {})}>{t('footer.madeBy')} ↗</a
		>
	</footer>
</div>

{#if pendingNavigation}
	<div class="navigation-backdrop">
		<div
			class="navigation-dialog"
			role="dialog"
			aria-modal="true"
			aria-labelledby="navigation-dialog-title"
			aria-describedby="navigation-dialog-description"
		>
			<strong id="navigation-dialog-title" class="navigation-dialog-title"
				>{t('nav.leaveQuizTitle')}</strong
			>
			<p id="navigation-dialog-description">{t('nav.leaveQuizMessage')}</p>
			<div class="dialog-actions">
				<button
					class="study-button secondary"
					type="button"
					onclick={() => (pendingNavigation = null)}
				>
					{t('nav.cancel')}
				</button>
				<button class="study-button danger" type="button" onclick={confirmPendingNavigation}>
					{t('nav.confirm')}
				</button>
			</div>
		</div>
	</div>
{/if}

<style>
	.navigation-dialog .study-button.danger:hover {
		background: color-mix(in srgb, var(--color-danger) 82%, black);
	}
</style>
