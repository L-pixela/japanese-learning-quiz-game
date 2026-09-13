<script lang="ts">
	import { page } from '$app/state'
	import { resolve } from '$app/paths'
	import type { Snippet } from 'svelte'
	import '$lib/styles/study.css'
	let { children }: { children: Snippet } = $props()
	const links = [
		{ href: '/dashboard', label: 'Overview', short: '01' },
		{ href: '/quiz', label: 'Practice', short: '02' },
		{ href: '/deck_list', label: 'My decks', short: '03' },
		{ href: '/team', label: 'Our team', short: '04' },
	] as const
</script>

<div class="study-app">
	<header class="study-nav">
		<a class="study-brand" href={resolve('/dashboard', {})}
			><span class="study-seal" lang="ja">単</span><span
				>TanTore<small>単語トレーニング</small></span
			></a
		>
		<nav aria-label="Main navigation">
			{#each links as link (link.href)}
				<a
					href={resolve(link.href, {})}
					aria-current={page.url.pathname.startsWith(link.href) ? 'page' : undefined}
					><small>{link.short}</small>{link.label}</a
				>
			{/each}
		</nav>
	</header>
	<main class="study-main">{@render children()}</main>
	<footer class="study-footer">
		<span>TanTore <span lang="ja">・ 一日一歩</span></span><span>A little practice, every day.</span
		><a href={resolve('/team', {})}>Made by our team ↗</a>
	</footer>
</div>
