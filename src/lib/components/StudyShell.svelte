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
	const links = [
		{ href: '/dashboard', key: 'nav.overview' },
		{ href: '/quiz', key: 'nav.quiz' },
		{ href: '/team', key: 'nav.team' },
		{ href: '/profile', key: 'nav.profile' },
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
			<AppControls />
		</nav>
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
	.navigation-backdrop {
		position: fixed;
		inset: 0;
		z-index: var(--z-modal);
		display: grid;
		place-items: center;
		padding: var(--spacing-lg);
		background: rgba(38, 48, 29, 0.52);
	}

	.navigation-dialog {
		width: min(440px, 100%);
		padding: clamp(26px, 5vw, 40px);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-xl);
		background: var(--color-surface);
		box-shadow: var(--shadow-lg);
		text-align: center;
	}

	.navigation-dialog-title {
		display: block;
		margin-bottom: 10px;
		font-weight: var(--font-weight-bold);
		font-size: var(--text-lg);
		color: var(--color-text);
	}

	.dialog-mark {
		display: grid;
		place-items: center;
		width: 48px;
		height: 48px;
		margin: 0 auto 18px;
		border-radius: var(--radius-full);
		background: var(--status-caution-soft);
		color: var(--color-danger);
		font-family: var(--font-display);
		font-size: var(--text-xl);
		font-weight: var(--font-weight-bold);
	}

	.navigation-dialog .study-eyebrow {
		margin-bottom: 12px;
	}

	.navigation-dialog h2 {
		margin-bottom: 10px;
	}

	.navigation-dialog > p:not(.study-eyebrow) {
		margin-bottom: 0;
		color: var(--color-text-secondary);
		line-height: var(--line-height-normal);
	}

	.dialog-actions {
		display: flex;
		justify-content: center;
		gap: var(--spacing-md);
		margin-top: 28px;
	}

	.navigation-dialog .study-button.danger:hover {
		background: color-mix(in srgb, var(--color-danger) 82%, black);
	}

	@media (max-width: 480px) {
		.dialog-actions {
			flex-direction: column-reverse;
		}
	}
</style>
