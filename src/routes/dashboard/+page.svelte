<script lang="ts">
	import { resolve } from '$app/paths'
	import StudyShell from '$lib/components/StudyShell.svelte'
	import JapanScene from '$lib/components/JapanScene.svelte'
	import RankBadge from '$lib/components/rank_badge.svelte'
	import { getRankFromPoints, getRankProgress } from '$lib/components/ranks'
	import { t } from '$lib/i18n.svelte'
	import type { PageData } from './$types'
	let { data }: { data: PageData } = $props()

	// Badges are earned by accumulating points, so the next one is a number
	// of points away.
	let badge = $derived(getRankFromPoints(data.user.points))
	let toNext = $derived(getRankProgress(data.user.points))
</script>

<svelte:head
	><title>{t('dashboard.eyebrow')} · TanTore</title><meta
		name="description"
		content="Your daily Japanese vocabulary practice. Ten levels, one small step at a time."
	/></svelte:head
>
<StudyShell>
	<div class="study-heading">
		<div>
			<p class="study-eyebrow">{t('dashboard.eyebrow')}</p>
			<h1>{t('dashboard.welcome', { name: data.user.username })}</h1>
			<p class="study-muted">{t('dashboard.lead')}</p>
		</div>
		<span class="study-stamp" lang="ja" aria-hidden="true">日々精進</span>
	</div>
	<section class="study-metrics" aria-label={t('a11y.learningSummary')}>
		<div class="study-metric">
			<small>{t('dashboard.totalPoints')}</small><strong>{data.user.points.toLocaleString()}</strong
			><span>{t('dashboard.totalPointsHint')}</span>
		</div>
		<div class="study-metric">
			<small>{t('dashboard.streak')}</small><strong
				>{data.user.streak}<span> {t('dashboard.streakDays')}</span></strong
			><span>{t('dashboard.streakHint')}</span>
		</div>
		<div class="study-metric">
			<small>{t('dashboard.rank')}</small>
			<RankBadge points={data.user.points} size="md" />
		</div>
		<div class="study-metric">
			<small>{t('dashboard.position')}</small><strong
				>{data.position ? '#' + data.position : '·'}</strong
			><span>{t('dashboard.positionHint')}</span>
		</div>
	</section>
	<section class="practice-hero">
		<div class="hero-copy">
			<p class="study-eyebrow">{t('dashboard.heroEyebrow')}</p>
			<h2>{t('dashboard.heroTitle')}</h2>
			<p>{t('dashboard.heroLead')}</p>
			<a class="study-button" href={resolve('/quiz', {})}
				>{t('dashboard.startQuiz')} <span aria-hidden="true">↗</span></a
			>
			<div class="hero-meta">
				<span>{t('dashboard.metaQuestions')}</span><span>{t('dashboard.metaPass')}</span><span
					>{t('dashboard.metaRange')}</span
				>
			</div>
		</div>
		<div class="hero-art">
			<JapanScene scene="fuji" />
			<span class="art-caption" lang="ja">一日一歩</span>
		</div>
	</section>
	<section class="board" id="leaderboard" aria-label={t('a11y.leaderboard')}>
		<div class="board-head">
			<div>
				<p class="study-eyebrow">{t('dashboard.boardEyebrow')}</p>
				<h2>{t('dashboard.boardTitle')}</h2>
			</div>
			<span class="board-position"
				>{data.position
					? t('dashboard.yourPosition', { n: data.position })
					: t('dashboard.unranked')}</span
			>
		</div>
		<div class="rank-status">
			<RankBadge points={data.user.points} size="sm" />
			<div class="rank-status-text">
				<strong><span lang="ja">{badge.nameJp}</span> · {badge.name}</strong>
				<small>{t('rank.earnedAt', { n: badge.minPoints })}</small>
			</div>
			{#if toNext}
				<div class="rank-next">
					<div class="rank-bar" aria-hidden="true">
						<span style={'width: ' + Math.round(toNext.fraction * 100) + '%'}></span>
					</div>
					<small
						>{t('rank.next')}: {toNext.next.name} · {t('rank.pointsToGo', {
							n: toNext.pointsToNext,
						})}</small
					>
				</div>
			{:else}
				<small class="rank-top">{t('rank.top')}</small>
			{/if}
		</div>
		<div class="board-table">
			<div class="board-columns" aria-hidden="true">
				<span class="col-rank">#</span><span class="col-name">{t('dashboard.colLearner')}</span
				><span class="col-university">{t('dashboard.colUniversity')}</span><span class="col-badge"
					>{t('profile.rank')}</span
				><span class="col-points">{t('dashboard.colPoints')}</span>
			</div>
			<ol class="board-list">
				{#each data.leaderboard as learner (learner.id)}<li class:you={learner.id === data.user.id}>
						<a
							class="board-entry"
							href={resolve('/profile/[id]', { id: learner.id })}
							aria-label={t('dashboard.viewProfile', { name: learner.username })}
						>
							<span class="board-rank">{String(learner.position).padStart(2, '0')}</span>
							<span class="board-name"
								>{learner.username}{#if learner.id === data.user.id}<em>{t('dashboard.you')}</em
									>{/if}</span
							>
							<span class="board-university">{learner.university ?? '·'}</span>
							<span class="board-badge"><RankBadge points={learner.points} size="sm" /></span>
							<span class="board-points"
								><span>{learner.points.toLocaleString()}</span><small>{t('nav.pts')}</small></span
							>
						</a>
					</li>{/each}
			</ol>
		</div>
	</section>
</StudyShell>

<style>
	.practice-hero {
		display: grid;
		grid-template-columns: 1.15fr 1fr;
		min-height: 360px;
		border-radius: var(--radius-xl);
		background: var(--panel-dark);
		box-shadow: var(--shadow-md);
		overflow: hidden;
	}
	.hero-copy {
		position: relative;
		z-index: 1;
		padding: var(--spacing-lg);
		color: var(--on-panel-dark);
	}
	.hero-copy :global(.study-eyebrow) {
		background: rgba(251, 247, 236, 0.18);
		color: var(--on-panel-dark);
	}
	.hero-copy h2,
	.hero-copy > p:not(.study-eyebrow) {
		white-space: pre-line;
	}
	.hero-copy h2 {
		margin-bottom: var(--spacing-lg);
		font-size: var(--font-size-display);
		line-height: var(--line-height-tight);
		letter-spacing: -0.5px;
	}
	.hero-copy > p:not(.study-eyebrow) {
		margin-bottom: var(--spacing-lg);
		font-size: var(--font-size-body);
		line-height: var(--line-height-relaxed);
		color: var(--on-panel-dark-muted);
	}
	.hero-copy :global(.study-button) {
		background: var(--color-accent);
		color: var(--panel-dark-deep) !important;
		box-shadow: var(--shadow-solid) rgba(0, 0, 0, 0.28);
	}
	.hero-copy :global(.study-button:hover) {
		background: var(--color-surface-sunken);
	}
	.hero-meta {
		display: flex;
		flex-wrap: wrap;
		gap: var(--spacing-md);
		margin-top: var(--spacing-lg);
	}
	.hero-meta span {
		padding: var(--spacing-sm) var(--spacing-md);
		border-radius: var(--radius-full);
		background: rgba(255, 248, 236, 0.16);
		font-size: var(--font-size-caption);
		font-weight: var(--font-weight-semibold);
	}
	.hero-art {
		position: relative;
		min-height: 300px;
	}
	.art-caption {
		position: absolute;
		top: 28px;
		right: 28px;
		color: var(--on-panel-dark);
		font-family: var(--font-display);
		font-size: 24px;
		letter-spacing: 8px;
		writing-mode: vertical-rl;
		text-shadow: 0 2px 10px rgba(20, 25, 17, 0.3);
	}
	.board {
		margin-top: var(--spacing-lg);
		/* Extra side padding leaves room for the highlighted row to sit inside
		   the rounded corners instead of bleeding into them. */
		padding: var(--spacing-lg);
		border-radius: var(--radius-lg);
		background: var(--panel-dark);
		color: var(--on-panel-dark);
		box-shadow: var(--shadow-md);
		overflow: hidden;
		/* Anchor scrolling in from the profile page: clear the sticky header. */
		scroll-margin-top: 90px;
	}
	.board-head {
		display: flex;
		align-items: baseline;
		justify-content: space-between;
		gap: var(--spacing-md);
		flex-wrap: wrap;
	}
	.board-head h2 {
		color: var(--on-panel-dark);
	}
	.board :global(.study-eyebrow) {
		background: rgba(251, 247, 236, 0.16);
		color: var(--on-panel-dark);
	}
	.board-position {
		padding: var(--spacing-md) var(--spacing-md);
		border-radius: var(--radius-full);
		background: var(--color-accent);
		color: var(--panel-dark-deep);
		font-size: var(--text-sm);
		font-weight: var(--font-weight-bold);
	}
	.board-table {
		display: grid;
		grid-template-columns: 48px minmax(0, 1.1fr) minmax(0, 1fr) 56px 92px;
		/* The rows are subgrids of this one, and a subgrid's tracks are laid out
		   against the parent's gutters — so the gap has to be declared here or
		   the rank number ends up touching the username. */
		column-gap: var(--spacing-md);
	}
	.board-columns,
	.board-list {
		grid-column: 1 / -1;
	}
	.board-list {
		display: grid;
		grid-template-columns: subgrid;
		row-gap: var(--spacing-sm);
	}
	.board-columns,
	.board-entry {
		display: grid;
		grid-template-columns: subgrid;
		grid-column: 1 / -1;
		grid-template-areas: 'rank name university badge points';
		gap: var(--spacing-md);
		align-items: center;
	}
	.board-badge {
		grid-area: badge;
		display: flex;
		justify-content: center;
		align-items: center;
	}
	/* The header cells sit in the same subgrid tracks as the row beneath, so
	   each one is aligned the way its own column's content is: the rank badge
	   is centred, so "Rank" is centred over it. */
	.board-columns .col-rank {
		grid-area: rank;
		padding-left: var(--spacing-md);
	}
	.board-columns .col-name {
		grid-area: name;
	}
	.board-columns .col-university {
		grid-area: university;
	}
	.board-columns .col-badge {
		grid-area: badge;
		text-align: center;
	}
	.board-columns .col-points {
		grid-area: points;
	}
	.rank-status {
		display: flex;
		align-items: center;
		gap: var(--spacing-md);
		flex-wrap: wrap;
		margin-top: var(--spacing-lg);
		padding: var(--spacing-md) var(--spacing-md);
		border-radius: var(--radius-md);
		background: rgba(251, 247, 236, 0.1);
	}
	.rank-status-text strong {
		display: block;
		font-size: var(--text-base);
	}
	.rank-status-text span {
		color: var(--on-panel-dark-muted);
		font-weight: var(--font-weight-medium);
	}
	.rank-status small,
	.rank-top {
		color: var(--on-panel-dark-muted);
		font-size: var(--text-sm);
	}
	.rank-next {
		flex: 1;
		min-width: 200px;
	}
	.rank-bar {
		height: 10px;
		margin-bottom: var(--spacing-sm);
		border-radius: var(--radius-full);
		background: rgba(251, 247, 236, 0.18);
		overflow: hidden;
	}
	.rank-bar span {
		display: block;
		height: 100%;
		border-radius: var(--radius-full);
		background: var(--color-accent);
	}
	.board-rank {
		grid-area: rank;
	}
	.board-name {
		grid-area: name;
	}
	.board-university {
		grid-area: university;
	}
	.board-points {
		grid-area: points;
	}
	.board-columns {
		margin-top: var(--spacing-lg);
		padding: 0 var(--spacing-md) var(--spacing-md);
		border-bottom: 1px solid rgba(251, 247, 236, 0.22);
		color: var(--on-panel-dark-muted);
		font-size: var(--text-sm);
		font-weight: var(--font-weight-semibold);
	}
	.board-list {
		list-style: none;
		padding: 0;
		margin: var(--spacing-md) 0 0;
	}
	.board-list li {
		display: grid;
		grid-template-columns: subgrid;
		grid-column: 1 / -1;
		border: 1px solid rgba(251, 247, 236, 0.12);
		border-radius: var(--radius-md);
		background: rgba(251, 247, 236, 0.04);
	}
	.board-entry {
		padding: var(--spacing-md) var(--spacing-md);
		border-radius: inherit;
		font-size: var(--text-base);
		font-weight: var(--font-weight-medium);
		text-decoration: none;
		transition: background var(--duration-fast) var(--ease-standard);
	}
	.board-entry:hover {
		background: rgba(251, 247, 236, 0.08);
	}
	.board-entry:focus-visible {
		outline: 2px solid var(--on-panel-dark);
		outline-offset: 2px;
	}
	.board-rank {
		padding-left: var(--spacing-md);
		color: var(--on-panel-dark-muted);
		font-family: var(--font-display);
		font-size: var(--text-base);
	}
	.board-name {
		overflow-wrap: anywhere;
	}
	.board-name em {
		display: inline-block;
		margin-left: var(--spacing-sm);
		padding: var(--spacing-sm) var(--spacing-md);
		border-radius: var(--radius-full);
		background: var(--color-accent);
		color: var(--panel-dark-deep);
		font-size: var(--text-xs);
		font-style: normal;
		font-weight: var(--font-weight-bold);
	}
	.board-university {
		color: var(--on-panel-dark-muted);
		font-size: var(--text-sm);
		overflow-wrap: anywhere;
	}
	.board-points {
		color: var(--on-panel-dark);
		font-family: var(--font-display);
		font-size: var(--text-lg);
		font-weight: var(--font-weight-bold);
	}
	.board-points small {
		margin-left: var(--spacing-sm);
		color: var(--on-panel-dark-muted);
		font-size: var(--text-xs);
		font-weight: var(--font-weight-medium);
	}
	.board-list li.you {
		border-color: color-mix(in srgb, var(--color-accent) 65%, transparent);
		background: rgba(251, 247, 236, 0.1);
		box-shadow: 0 0 12px color-mix(in srgb, var(--color-accent) 12%, transparent);
	}
	@media (max-width: 800px) {
		.hero-copy {
			padding: var(--spacing-lg);
		}
	}
	@media (max-width: 550px) {
		.practice-hero {
			grid-template-columns: 1fr;
		}
		.hero-art {
			min-height: 210px;
		}
		.art-caption {
			font-size: 18px;
			letter-spacing: 5px;
		}
		.board {
			padding: var(--spacing-lg) var(--spacing-lg) var(--spacing-lg);
		}
		.board-table {
			grid-template-columns: auto minmax(0, 1fr) 92px;
			column-gap: var(--spacing-md);
		}
		.board-columns,
		.board-entry {
			gap: var(--spacing-sm) var(--spacing-md);
		}
		/* Narrow screens: university and badge drop to a second line. */
		.board-entry {
			grid-template-areas: 'rank name points' '. university badge';
		}
		.board-columns {
			grid-template-areas: 'rank name points';
		}
		.board-columns > span:nth-child(3),
		.board-columns > span:nth-child(4) {
			display: none;
		}
	}
</style>
