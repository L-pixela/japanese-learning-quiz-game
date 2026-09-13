<script lang="ts">
	import { resolve } from '$app/paths'
	import StudyShell from '$lib/components/StudyShell.svelte'
	import { STATUS_LABELS } from '$lib/levels'
	import type { PageData } from './$types'
	let { data }: { data: PageData } = $props()
	let completed = $derived(data.levels.filter((level) => level.status === 'completed').length)
</script>

<svelte:head><title>The vocabulary path · TanTore</title></svelte:head>
<StudyShell>
	<div class="study-heading">
		<div>
			<p class="study-eyebrow">Practice / 練習</p>
			<h1>Your vocabulary path.</h1>
			<p class="study-muted">Ten stops, from familiar words to new ideas. Begin anywhere.</p>
		</div>
		<span class="study-stamp" lang="ja">学びの道</span>
	</div>
	<div class="map-overview">
		<div>
			<strong>{completed}<span> / 10</span></strong>
			<p>levels completed</p>
		</div>
		<div class="map-progress">
			<progress value={completed} max="10" aria-label="Levels completed"></progress>
			<p>10 questions per quiz · 1 point per correct answer · 6 correct to pass</p>
		</div>
	</div>
	<div class="legend" aria-label="Level status legend">
		{#each Object.entries(STATUS_LABELS) as [status, label] (status)}<span
				class={'study-pill ' + status}><span aria-hidden="true">●</span>{label}</span
			>{/each}
	</div>
	<div class="level-path">
		{#each [{ name: 'Easy', range: '01 — 03', label: 'Build your foundation', japanese: '基礎' }, { name: 'Medium', range: '04 — 07', label: 'Broaden your world', japanese: '成長' }, { name: 'Hard', range: '08 — 10', label: 'Find the finer meaning', japanese: '挑戦' }] as group (group.name)}
			<section class="level-group">
				<div class="group-heading">
					<span lang="ja">{group.japanese}</span>
					<div>
						<p class="study-eyebrow">{group.name} / {group.range}</p>
						<h2>{group.label}</h2>
					</div>
				</div>
				<div class="level-grid">
					{#each data.levels.filter((level) => level.difficulty === group.name) as level (level.level)}<a
							class={'level-tile ' + level.status}
							href={resolve('/quiz/[level]', { level: String(level.level) })}
							><div class="tile-top">
								<span class="level-number">{String(level.level).padStart(2, '0')}</span><span
									class={'study-pill ' + level.status}
									>{level.status === 'completed' ? '✓ ' : ''}{STATUS_LABELS[level.status]}</span
								>
							</div>
							<span class="tile-japanese" lang="ja">{level.japanese}</span>
							<h3>{level.name}</h3>
							<p>{level.description}</p>
							<div class="tile-bottom">
								<span
									>{level.attempts
										? 'Best ' + level.bestScore + '/10 · ' + level.attempts + ' attempts'
										: '10 questions'}</span
								><span aria-hidden="true">↗</span>
							</div></a
						>{/each}
				</div>
			</section>
		{/each}
	</div>
	<p class="study-muted map-note">
		A completed level stays completed. Come back whenever you want a fresh set of words.
	</p>
</StudyShell>

<style>
	.map-overview {
		display: flex;
		gap: 35px;
		align-items: center;
		border-block: 1px solid #d9d9cb;
		padding: 25px 0;
	}
	.map-overview strong {
		font-size: 35px;
		font-weight: 500;
	}
	.map-overview strong span {
		font-size: 19px;
		color: #818575;
	}
	.map-overview p {
		font-size: 11px;
		color: #62695f;
		margin: 7px 0 0;
	}
	.map-progress {
		flex: 1;
	}
	progress {
		width: 100%;
		height: 6px;
		accent-color: #37664d;
		border: 0;
		display: block;
	}
	progress::-webkit-progress-bar {
		background: #dedfd3;
	}
	progress::-webkit-progress-value {
		background: #37664d;
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
		border-left: 1px solid #c9cdbc;
	}
	.group-heading {
		display: flex;
		gap: 16px;
		align-items: center;
		margin-bottom: 18px;
	}
	.group-heading::before {
		content: '';
		width: 9px;
		height: 9px;
		background: #aa4235;
		border: 4px solid #f5f2e9;
		box-sizing: content-box;
		position: absolute;
		left: -9px;
		top: 15px;
		border-radius: 50%;
	}
	.group-heading > span {
		font-family: 'Yu Mincho', serif;
		font-size: 30px;
		color: #848b79;
		letter-spacing: 3px;
	}
	.group-heading p {
		margin: 0 0 4px;
	}
	.group-heading h2 {
		font-size: 20px;
		margin: 0;
	}
	.level-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(190px, 1fr));
		gap: 14px;
	}
	.level-tile {
		display: block;
		text-decoration: none;
		background: #fcfaf3;
		border: 1px solid #d4d7c9;
		border-top: 3px solid #a8afa1;
		padding: 18px;
		border-radius: 3px;
		transition:
			transform 150ms ease,
			border-color 150ms ease;
	}
	.level-tile:hover {
		transform: translateY(-3px);
		border-color: #aa4235;
	}
	.level-tile.completed {
		border-top-color: #37664d;
		background: #f0f4e9;
	}
	.level-tile.attempted {
		border-top-color: #c6a03e;
		background: #fbf6e5;
	}
	.tile-top {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 8px;
	}
	.level-number {
		font-size: 14px;
		color: #62695f;
	}
	.tile-top .study-pill {
		font-size: 9px;
		padding: 4px 6px;
	}
	.tile-japanese {
		display: block;
		font-family: 'Yu Mincho', serif;
		color: #6b7966;
		font-size: 30px;
		margin: 25px 0 12px;
	}
	.level-tile h3 {
		margin-bottom: 7px;
		font-size: 17px;
	}
	.level-tile p {
		color: #62695f;
		font-size: 11px;
		min-height: 34px;
	}
	.tile-bottom {
		border-top: 1px solid #d9d9cb;
		padding-top: 14px;
		display: flex;
		justify-content: space-between;
		font-size: 10px;
	}
	.tile-bottom > span:last-child {
		color: #aa4235;
		font-size: 16px;
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
	}
</style>
