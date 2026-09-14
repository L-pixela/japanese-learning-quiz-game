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
	><title>Your study desk · TanTore</title><meta
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
	<section class="study-metrics" aria-label="Your learning summary">
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
	<section class="board" aria-label="Leaderboard">
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
				<span>#</span><span>{t('dashboard.colLearner')}</span><span
					>{t('dashboard.colUniversity')}</span
				><span>{t('profile.rank')}</span><span>{t('dashboard.colPoints')}</span>
			</div>
			<ol class="board-list">
				{#each data.leaderboard as learner (learner.id)}<li
						class:you={learner.id === data.user.id}
						class:podium={learner.position <= 3}
					>
						<span class="board-rank">{String(learner.position).padStart(2, '0')}</span>
						<span class="board-name"
							>{learner.username}{#if learner.id === data.user.id}<em>{t('dashboard.you')}</em
								>{/if}</span
						>
						<span class="board-university">{learner.university ?? '·'}</span>
						<span class="board-badge"><RankBadge points={learner.points} size="sm" /></span>
						<span class="board-points"
							><span>{learner.points.toLocaleString()}</span><small>PTS</small></span
						>
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
		padding: clamp(24px, 3.2vw, 48px);
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
		margin-bottom: 18px;
		font-size: var(--font-size-display);
		line-height: 1.05;
		letter-spacing: -1.5px;
	}
	.hero-copy > p:not(.study-eyebrow) {
		margin-bottom: 26px;
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
		gap: 10px;
		margin-top: 26px;
	}
	.hero-meta span {
		padding: 7px 14px;
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
		margin-top: 30px;
		/* Extra side padding leaves room for the highlighted row to sit inside
		   the rounded corners instead of bleeding into them. */
		padding: 30px clamp(20px, 2.4vw, 34px) 24px;
		border-radius: var(--radius-lg);
		background: var(--panel-dark);
		color: var(--on-panel-dark);
		box-shadow: var(--shadow-md);
		overflow: hidden;
	}
	.board-head {
		display: flex;
		align-items: baseline;
		justify-content: space-between;
		gap: 12px;
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
		padding: 9px 16px;
		border-radius: var(--radius-full);
		background: var(--color-accent);
		color: var(--panel-dark-deep);
		font-size: var(--text-sm);
		font-weight: var(--font-weight-bold);
	}
	.board-table {
		display: grid;
		grid-template-columns: 48px minmax(0, 1.1fr) minmax(0, 1fr) 44px 92px;
	}
	.board-columns,
	.board-list {
		grid-column: 1 / -1;
	}
	.board-list {
		display: grid;
		grid-template-columns: subgrid;
	}
	.board-columns,
	.board-list li {
		display: grid;
		grid-template-columns: subgrid;
		grid-column: 1 / -1;
		grid-template-areas: 'rank name university badge points';
		gap: 14px;
		align-items: center;
	}
	.board-badge {
		grid-area: badge;
		display: flex;
		justify-content: center;
	}
	.rank-status {
		display: flex;
		align-items: center;
		gap: 14px;
		flex-wrap: wrap;
		margin-top: 20px;
		padding: 14px 16px;
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
		margin-bottom: 6px;
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
		margin-top: 22px;
		padding: 0 12px 12px;
		border-bottom: 1px solid rgba(251, 247, 236, 0.22);
		color: var(--on-panel-dark-muted);
		font-size: var(--text-sm);
		font-weight: var(--font-weight-semibold);
	}
	.board-list {
		list-style: none;
		padding: 0;
		margin: 0;
	}
	.board-list li {
		padding: 16px 12px;
		border-bottom: 1px solid rgba(251, 247, 236, 0.12);
		font-size: var(--text-base);
		font-weight: var(--font-weight-medium);
	}
	.board-list li:last-child {
		border-bottom: 0;
	}
	.board-rank {
		padding-left: 10px;
		border-left: 4px solid transparent;
		color: var(--on-panel-dark-muted);
		font-family: var(--font-display);
		font-size: var(--text-base);
	}
	/* Top three get the accent; everyone else stays quiet. */
	.podium .board-rank {
		color: var(--color-accent);
		border-left-color: var(--color-accent);
	}
	.board-name {
		overflow-wrap: anywhere;
	}
	.board-name em {
		margin-left: 8px;
		padding: 3px 10px;
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
		margin-left: 5px;
		color: var(--on-panel-dark-muted);
		font-size: var(--text-xs);
		font-weight: var(--font-weight-medium);
	}
	.you {
		border-radius: var(--radius-md);
		background: rgba(251, 247, 236, 0.14);
		box-shadow: inset 4px 0 0 var(--color-accent);
	}
	@media (max-width: 800px) {
		.hero-copy {
			padding: 28px;
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
			padding: 22px 18px 6px;
		}
		.board-table {
			grid-template-columns: 40px minmax(0, 1fr) 92px;
		}
		.board-columns,
		.board-list li {
			gap: 2px 10px;
		}
		/* Narrow screens: university and badge drop to a second line. */
		.board-list li {
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
