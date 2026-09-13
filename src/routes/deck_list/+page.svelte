<script lang="ts">
	import { resolve } from '$app/paths'
	import StudyShell from '$lib/components/StudyShell.svelte'
	import { t } from '$lib/i18n.svelte'
	import type { PageData } from './$types'

	let { data }: { data: PageData } = $props()
	let search = $state('')

	let current = $derived(data.levels.find((entry) => entry.level === data.level) ?? data.levels[0])
	let words = $derived(
		data.words.filter((word) => {
			const term = search.trim().toLowerCase()
			return (
				!term ||
				word.japanese.includes(term) ||
				word.reading.includes(term) ||
				word.meaning.toLowerCase().includes(term)
			)
		}),
	)
</script>

<svelte:head
	><title>My deck · TanTore</title><meta
		name="description"
		content="Every word behind each TanTore level. Study the deck, then take the quiz."
	/></svelte:head
>
<StudyShell>
	<div class="study-heading">
		<div>
			<p class="study-eyebrow">{t('deck.eyebrow')}</p>
			<h1>{t('deck.title')}</h1>
			<p class="study-muted">{t('deck.lead')}</p>
		</div>
		<span class="study-stamp" lang="ja">単語</span>
	</div>

	<nav class="level-tabs" aria-label={t('deck.chooseLevel')}>
		{#each data.levels as level (level.level)}<a
				href={resolve('/deck_list', {}) + '?level=' + level.level}
				class:current={level.level === data.level}
				class:done={level.status === 'completed'}
				aria-current={level.level === data.level ? 'page' : undefined}
				><small>{String(level.level).padStart(2, '0')}</small><span lang="ja">{level.japanese}</span
				></a
			>{/each}
	</nav>

	<section class="deck-head">
		<div>
			<p class="study-eyebrow">
				{t('deck.level')}
				{String(data.level).padStart(2, '0')} · {current.difficulty}
			</p>
			<h2>{current.name} <span lang="ja">{current.japanese}</span></h2>
			<p class="study-muted">{current.description}</p>
		</div>
		<div class="deck-facts">
			<div><strong>{data.count}</strong><small>{t('deck.wordsInDeck')}</small></div>
			<div><strong>10</strong><small>{t('deck.drawnPerQuiz')}</small></div>
			<div>
				<strong class={'status ' + current.status}>{t(`status.${current.status}`)}</strong><small
					>{current.attempts
						? t('deck.bestScore', { score: current.bestScore })
						: t('deck.notAttempted')}</small
				>
			</div>
		</div>
	</section>

	<div class="deck-actions">
		<input
			type="search"
			placeholder={t('deck.search')}
			aria-label={t('deck.searchLabel')}
			bind:value={search}
		/>
		<a class="study-button" href={resolve('/quiz/[level]', { level: String(data.level) })}
			>{t('deck.quizThisLevel')} <span aria-hidden="true">↗</span></a
		>
	</div>

	{#if data.count === 0}
		<p class="deck-empty">{t('deck.empty')}</p>
	{:else if words.length === 0}
		<p class="deck-empty">{t('deck.noMatch', { term: search })}</p>
	{:else}
		<ol class="word-list" aria-label={'Vocabulary for level ' + data.level}>
			{#each words as word, index (word.id)}<li>
					<span class="word-index">{String(index + 1).padStart(2, '0')}</span>
					<span class="word-japanese" lang="ja">{word.japanese}</span>
					<span class="word-reading" lang="ja">{word.reading}</span>
					<span class="word-meaning">{word.meaning}</span>
				</li>{/each}
		</ol>
		<p class="study-muted deck-note">
			{t('deck.showing', { shown: words.length, total: data.count })}
		</p>
	{/if}
</StudyShell>

<style>
	.level-tabs {
		display: grid;
		grid-template-columns: repeat(10, 1fr);
		gap: 6px;
		margin: 35px 0 30px;
	}
	.level-tabs a {
		display: grid;
		gap: 3px;
		justify-items: center;
		padding: 13px 4px;
		border-radius: var(--radius-md);
		background: var(--color-surface);
		box-shadow: var(--shadow-solid) var(--color-border);
		font-family: var(--font-display);
		font-size: var(--font-size-body);
		font-weight: var(--font-weight-bold);
		text-decoration: none;
	}
	.level-tabs small {
		font-size: var(--font-size-caption);
		letter-spacing: 1px;
		color: var(--color-text-faint);
	}
	.level-tabs a.done {
		background: var(--color-success-soft);
		box-shadow: var(--shadow-solid) var(--color-border-strong);
	}
	.level-tabs a.current {
		background: var(--color-primary);
		color: var(--color-on-primary);
		box-shadow: var(--shadow-solid) var(--color-primary-shadow);
	}
	.level-tabs a.current small {
		color: var(--color-primary-soft);
	}
	.deck-head {
		display: flex;
		flex-wrap: wrap;
		gap: 25px;
		justify-content: space-between;
		align-items: end;
		padding: 26px 30px;
		border-radius: var(--radius-lg);
		background: var(--color-surface);
		box-shadow: var(--shadow-sm);
	}
	.deck-head h2 span {
		margin-left: 8px;
		color: var(--color-primary);
		font-size: var(--font-size-h3);
	}
	.deck-facts {
		display: flex;
		gap: 30px;
	}
	.deck-facts div {
		display: grid;
		gap: 3px;
	}
	.deck-facts strong {
		font-family: var(--font-display);
		font-size: clamp(20px, 3.3vw, 30px);
		font-weight: var(--font-weight-bold);
	}
	.deck-facts small {
		font-size: var(--font-size-caption);
		color: var(--color-text-secondary);
	}
	.status {
		font-size: 13px !important;
	}
	.status.completed {
		color: var(--color-success);
	}
	.status.attempted {
		color: var(--status-caution);
	}
	.status.not_started {
		color: var(--status-neutral);
	}
	.deck-actions {
		display: flex;
		gap: 14px;
		align-items: center;
		margin: 26px 0 18px;
	}
	.deck-actions input {
		flex: 1;
		min-width: 0;
		min-height: 56px;
		padding: 14px 22px;
		border: 2px solid var(--color-border);
		border-radius: var(--radius-full);
		background: var(--color-surface);
		font: inherit;
		font-size: var(--font-size-body);
	}
	.deck-actions input:focus {
		border-color: var(--color-primary);
		outline: none;
	}
	.word-list {
		list-style: none;
		padding: 0;
		margin: 0;
		border-radius: var(--radius-lg);
		background: var(--color-surface);
		box-shadow: var(--shadow-sm);
		overflow: hidden;
	}
	.word-list li {
		display: grid;
		grid-template-columns: 44px minmax(0, 1fr) minmax(0, 1fr) minmax(0, 1.4fr);
		gap: 14px;
		align-items: baseline;
		padding: 16px 24px;
		border-bottom: 1px solid var(--color-border-subtle);
	}
	.word-list li:last-child {
		border-bottom: 0;
	}
	.word-list li:nth-child(even) {
		background: var(--color-surface-sunken);
	}
	.word-index {
		color: var(--color-text-faint);
		font-size: var(--font-size-caption);
		font-weight: var(--font-weight-semibold);
	}
	.word-japanese {
		font-family: var(--font-display);
		font-size: clamp(18px, 2.7vw, 24px);
		font-weight: var(--font-weight-bold);
	}
	.word-reading {
		color: var(--color-primary);
		font-size: var(--font-size-body);
	}
	.word-meaning {
		font-size: var(--font-size-body);
		overflow-wrap: anywhere;
	}
	.deck-empty {
		padding: 44px;
		border-radius: var(--radius-lg);
		border: 2px dashed var(--color-border-strong);
		color: var(--color-text-secondary);
		font-size: var(--font-size-body);
		text-align: center;
	}
	.deck-note {
		margin-top: 18px;
		font-size: var(--font-size-caption);
	}
	@media (max-width: 800px) {
		.level-tabs {
			grid-template-columns: repeat(5, 1fr);
		}
		.deck-facts {
			gap: 20px;
		}
	}
	@media (max-width: 550px) {
		.deck-actions {
			flex-direction: column;
			align-items: stretch;
		}
		.word-list li {
			grid-template-columns: 26px minmax(0, 1fr);
			gap: 4px 10px;
			row-gap: 2px;
		}
		.word-reading,
		.word-meaning {
			grid-column: 2;
		}
	}
</style>
