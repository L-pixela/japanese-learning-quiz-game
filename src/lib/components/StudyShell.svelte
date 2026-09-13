<script lang="ts">
	import { page } from '$app/state'
	import { resolve } from '$app/paths'
	import type { Snippet } from 'svelte'
	import '$lib/styles/study.css'
	import AppControls from './AppControls.svelte'
	import { t } from '$lib/i18n.svelte'
	let { children }: { children: Snippet } = $props()
	const links = [
		{ href: '/dashboard', key: 'nav.overview' },
		{ href: '/quiz', key: 'nav.quiz' },
		{ href: '/deck_list', key: 'nav.decks' },
		{ href: '/team', key: 'nav.team' },
		{ href: '/profile', key: 'nav.profile' },
	] as const
</script>

<div class="study-app">
	<header class="study-nav">
		<a class="study-brand" href={resolve('/dashboard', {})}
			><span class="study-seal" lang="ja">単</span><span
				>TanTore<small>{t('nav.brandTagline')}</small></span
			></a
		>
		<nav aria-label="Main navigation">
			{#each links as link (link.href)}
				<a
					href={resolve(link.href, {})}
					aria-current={page.url.pathname.startsWith(link.href) ? 'page' : undefined}
					>{t(link.key)}</a
				>
			{/each}
		</nav>
		<AppControls />
	</header>
	<main class="study-main">{@render children()}</main>
	<footer class="study-footer">
		<span>TanTore <span lang="ja">・ 一日一歩</span></span><span>{t('footer.tagline')}</span><a
			href={resolve('/team', {})}>{t('footer.madeBy')} ↗</a
		>
	</footer>
</div>
