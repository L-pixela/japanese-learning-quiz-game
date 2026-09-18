<script lang="ts">
	import { resolve } from '$app/paths'
	import StudyShell from '$lib/components/StudyShell.svelte'
	import { STATUSES } from '$lib/levels'
	import { t, levelName, levelDesc, difficultyLabel } from '$lib/i18n.svelte'
	import type { PageData } from './$types'
	let { data }: { data: PageData } = $props()
	let completed = $derived(data.levels.filter((level) => level.status === 'completed').length)

	const GROUPS = [
		{ name: 'Easy', range: '01 to 03', japanese: '基礎' },
		{ name: 'Medium', range: '04 to 07', japanese: '成長' },
		{ name: 'Hard', range: '08 to 10', japanese: '挑戦' },
	] as const
</script>

<svelte:head><title>{t('nav.quiz')} · TanTore</title></svelte:head>
<StudyShell>
	<div class="study-heading">
		<div>
			<p class="study-eyebrow">{t('quiz.eyebrow')}</p>
			<h1>{t('quiz.title')}</h1>
			<p class="study-muted">{t('quiz.lead')}</p>
		</div>
		<span class="study-stamp" lang="ja">学びの道</span>
	</div>
	<div class="map-overview">
		<div>
			<strong>{completed}<span> / 10</span></strong>
			<p>{t('quiz.levelsCompleted')}</p>
		</div>
		<div class="map-progress">
			<progress value={completed} max="10" aria-label={t('a11y.levelsCompleted')}></progress>
			<p>{t('quiz.rules')}</p>
		</div>
	</div>
	<div class="legend" aria-label={t('a11y.levelLegend')}>
		{#each STATUSES as status (status)}<span class={'study-pill ' + status}
				><span aria-hidden="true">●</span>{t(`status.${status}`)}</span
			>{/each}
	</div>
	<div class="level-path">
		{#each GROUPS as group (group.name)}
			<section class="level-group">
				<div class="group-heading">
					<span lang="ja">{group.japanese}</span>
					<div class="group-meta">
						<p class="study-eyebrow">{difficultyLabel(group.name)} / {group.range}</p>
					</div>
					<h2>{t(`group.${group.name}`)}</h2>
				</div>
				<div class="level-grid">
					{#each data.levels.filter((level) => level.difficulty === group.name) as level (level.level)}<a
							class={'level-tile ' + level.status}
							href={resolve('/quiz/[level]', { level: String(level.level) })}
							><div class="tile-top">
								<span class="level-number">{String(level.level).padStart(2, '0')}</span><span
									class={'study-pill ' + level.status}
									>{level.status === 'completed' ? '✓ ' : ''}{t(`status.${level.status}`)}</span
								>
							</div>
							<span class="tile-japanese" lang="ja">{level.japanese}</span>
							<h3>{levelName(level.level)}</h3>
							<p>{levelDesc(level.level)}</p>
							<div class="tile-bottom">
								<span
									>{level.attempts
										? t('quiz.tileBest', {
												score: level.bestScore,
												attempts: level.attempts,
											})
										: t('quiz.tileQuestions')}</span
								><span aria-hidden="true">↗</span>
							</div></a
						>{/each}
				</div>
			</section>
		{/each}
	</div>
</StudyShell>

<style>
	.map-overview {
		display: flex;
		gap: 35px;
		align-items: center;
		padding: 26px 30px;
		border-radius: var(--radius-lg);
		background: var(--color-surface);
		box-shadow: var(--shadow-sm);
	}
	.map-overview strong {
		font-family: var(--font-display);
		font-size: clamp(26px, 4.4vw, 40px);
		font-weight: var(--font-weight-bold);
	}
	.map-overview strong span {
		font-size: clamp(14px, 2.2vw, 20px);
		color: var(--color-text-faint);
	}
	.map-overview p {
		font-size: var(--font-size-caption);
		color: var(--color-text-secondary);
		margin: 7px 0 0;
	}
	.map-progress {
		flex: 1;
	}
	progress {
		display: block;
		width: 100%;
		height: 14px;
		border: 0;
		border-radius: var(--radius-full);
		accent-color: var(--color-success);
	}
	progress::-webkit-progress-bar {
		border-radius: var(--radius-full);
		background: var(--color-border-subtle);
	}
	progress::-webkit-progress-value {
		border-radius: var(--radius-full);
		background: var(--color-success);
	}
	.legend {
		display: flex;
		gap: 10px;
		flex-wrap: wrap;
		margin: 24px 0 35px;
	}
	.level-group {
		position: relative;
		padding: 0 0 38px 30px;
		border-left: 2px dashed var(--color-border-strong);
	}
	.group-heading {
		display: grid;
		grid-template-columns: auto minmax(0, 1fr);
		gap: 16px;
		align-items: center;
		margin-bottom: 18px;
	}
	.group-heading::before {
		content: '';
		width: 9px;
		height: 9px;
		background: var(--color-primary);
		border: 4px solid var(--color-background);
		box-sizing: content-box;
		position: absolute;
		left: -9px;
		top: 30px;
		border-radius: 50%;
	}
	.group-heading > span {
		display: grid;
		place-items: center;
		width: 78px;
		height: 78px;
		border-radius: var(--radius-md);
		background: var(--color-primary-soft);
		color: var(--color-primary-active);
		font-family: var(--font-display);
		font-size: clamp(18px, 2.9vw, 26px);
		font-weight: var(--font-weight-bold);
	}
	.group-meta {
		display: flex;
		align-items: center;
		min-width: 0;
	}
	.group-heading p {
		display: inline-flex;
		align-items: center;
		min-height: 52px;
		margin: 0;
		padding: 10px 24px;
	}
	.group-heading h2 {
		grid-column: 1 / -1;
		margin: 0;
		color: var(--color-text);
	}
	.level-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(190px, 1fr));
		gap: 14px;
	}
	.level-tile {
		display: block;
		padding: 22px;
		border-radius: var(--radius-lg);
		background: var(--color-surface);
		box-shadow: var(--shadow-solid) var(--color-border);
		text-decoration: none;
		transition:
			transform var(--duration-base) var(--ease-standard),
			box-shadow var(--duration-base) var(--ease-standard);
	}
	.level-tile:hover {
		transform: translateY(-4px);
		box-shadow: 0 8px 0 var(--color-primary);
	}
	.level-tile.completed {
		background: var(--color-success-soft);
		box-shadow: var(--shadow-solid) var(--color-border-strong);
	}
	.level-tile.attempted {
		background: var(--status-caution-soft);
		box-shadow: var(--shadow-solid) var(--color-border-strong);
	}
	.tile-top {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 8px;
	}
	.level-number {
		font-size: var(--font-size-small);
		color: var(--color-text-secondary);
	}
	.tile-top .study-pill {
		font-size: var(--font-size-caption);
		padding: 4px 6px;
	}
	.tile-japanese {
		display: block;
		margin: 24px 0 12px;
		color: var(--color-primary);
		font-family: var(--font-display);
		font-size: clamp(22px, 3.8vw, 34px);
		font-weight: var(--font-weight-bold);
	}
	.level-tile h3 {
		margin-bottom: 7px;
		font-size: var(--font-size-body);
	}
	.level-tile p {
		color: var(--color-text-secondary);
		font-size: var(--font-size-caption);
		min-height: 34px;
	}
	.tile-bottom {
		display: flex;
		justify-content: space-between;
		margin-top: 16px;
		padding-top: 14px;
		border-top: 1px solid var(--color-border);
		font-size: var(--font-size-caption);
		font-weight: var(--font-weight-semibold);
	}
	.tile-bottom > span:last-child {
		color: var(--color-primary);
		font-size: var(--font-size-body);
	}
	.map-note {
		margin-left: 30px;
	}
	@media (prefers-reduced-motion: reduce) {
		.level-tile {
			transition: none;
		}
	}
	@media (max-width: 550px) {
		.level-group {
			padding-left: 20px;
		}
		.level-grid {
			grid-template-columns: 1fr;
		}
		.map-overview {
			gap: 20px;
		}
		.group-heading {
			gap: 12px;
		}
		.group-heading::before {
			top: 25px;
		}
		.group-heading > span {
			width: 68px;
			height: 68px;
		}
		.group-heading p {
			min-height: 48px;
			padding-inline: 16px;
		}
	}
</style>
