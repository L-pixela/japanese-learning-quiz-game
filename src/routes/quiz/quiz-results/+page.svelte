<script lang="ts">
	import { resolve } from '$app/paths'
	import StudyShell from '$lib/components/StudyShell.svelte'
	import JapanScene from '$lib/components/JapanScene.svelte'
	import { LEVELS } from '$lib/levels'
	import type { PageData } from './$types'
	let { data }: { data: PageData } = $props()
	let result = $derived(data.result)
</script>

<svelte:head><title>Your quiz results · TanTore</title></svelte:head>
<StudyShell>
	{#if result}
		<section class={'verdict ' + (result.passed ? 'passed' : 'retry')}>
			<div class="verdict-art">
				<JapanScene scene={result.passed ? 'torii' : 'daruma'} />
			</div>
			<div class="verdict-copy">
				<p class="study-eyebrow">Practice complete / おつかれさま</p>
				<h1>{result.passed ? 'One step further.' : 'Every attempt is progress.'}</h1>
				<p>
					{result.passed
						? 'You passed this level. Take that feeling into the next one.'
						: 'A few more words to get familiar with. You can try again anytime.'}
				</p>
				<span class="verdict-stamp" lang="ja">{result.passed ? '合格' : '復習'}</span>
			</div>
		</section>
		<div class="results-layout">
			<section class="score-panel study-panel">
				<p class="study-eyebrow">
					Level {String(result.level).padStart(2, '0')} · {result.difficulty}
				</p>
				<h2>{LEVELS[result.level - 1].name}</h2>
				<div
					class="score-circle"
					class:passed={result.passed}
					style={'--score: ' + result.score * 10 + '%'}
				>
					<div><strong>{result.score}<span>/10</span></strong><small>CORRECT ANSWERS</small></div>
				</div>
				<span class={'study-pill ' + (result.passed ? 'completed' : 'attempted')}
					>{result.passed ? '✓ Passed' : 'Not passed this time'}</span
				>
				<p class="study-muted">Pass mark: 6 out of 10</p>
			</section>
			<div class="result-details">
				<section class="study-panel earned">
					<div>
						<p class="study-eyebrow">Points earned</p>
						<strong>+{result.pointsEarned}<span> pt</span></strong>
					</div>
					<p class="study-muted">
						{result.user.points.toLocaleString()} total points<br />{result.user.streak}-day streak
					</p>
				</section>
				<section class="study-panel community">
					<p class="study-eyebrow">A shared milestone / みんなの記録</p>
					<strong>{result.completion.percentage}<span>%</span></strong>
					<h2>have completed this level</h2>
					<p class="study-muted">
						{result.completion.completedUsers} of {result.completion.totalUsers} registered learners have
						passed Level {result.level}.
					</p>
					<div class="community-bar" aria-hidden="true">
						<span style={'width: ' + result.completion.percentage + '%'}></span>
					</div>
					<small>Each learner counts once, however many times they practice.</small>
				</section>
			</div>
		</div>
		<div class="study-actions">
			{#if result.passed && result.level < 10}<a
					class="study-button"
					href={resolve('/quiz/[level]', { level: String(result.level + 1) })}>Next level →</a
				>{:else}<a
					class="study-button"
					href={resolve('/quiz/[level]', { level: String(result.level) })}>Practice again ↗</a
				>{/if}<a class="study-button secondary" href={resolve('/quiz', {})}>Back to the path</a><a
				class="dashboard-link"
				href={resolve('/dashboard', {})}>Your study desk</a
			>
		</div>
	{:else}<section class="study-panel">
			<p class="study-eyebrow">Your next chapter</p>
			<h1>A little practice comes first.</h1>
			<p class="study-muted">Finish a level quiz to see your score and progress here.</p>
			<a class="study-button" href={resolve('/quiz', {})}>Choose a level →</a>
		</section>{/if}
</StudyShell>

<style>
	.verdict {
		display: grid;
		grid-template-columns: 260px minmax(0, 1fr);
		align-items: center;
		gap: 30px;
		margin-bottom: 30px;
		padding: 34px 40px;
		border-radius: var(--radius-xl);
		background: linear-gradient(120deg, var(--color-primary) 0%, var(--color-secondary) 100%);
		box-shadow: var(--shadow-md);
		color: var(--color-on-primary);
	}
	.verdict.retry {
		background: linear-gradient(120deg, var(--color-canvas-deep) 0%, var(--color-primary) 100%);
	}
	.verdict-art {
		aspect-ratio: 1;
		border-radius: var(--radius-lg);
		background: rgba(255, 248, 236, 0.14);
		overflow: hidden;
	}
	.verdict-copy :global(.study-eyebrow) {
		background: rgba(255, 248, 236, 0.2);
		color: var(--color-on-primary);
	}
	.verdict-copy h1 {
		font-size: var(--font-size-display);
		line-height: 1.05;
	}
	.verdict-copy p {
		margin-bottom: 0;
		font-size: var(--font-size-body);
		line-height: var(--line-height-relaxed);
		color: rgba(255, 248, 236, 0.92);
	}
	.verdict-stamp {
		display: inline-block;
		margin-top: 20px;
		padding: 10px 22px;
		border-radius: var(--radius-full);
		background: var(--color-surface);
		color: var(--color-primary-active);
		box-shadow: var(--shadow-solid) rgba(20, 25, 17, 0.22);
		font-family: var(--font-display);
		font-size: 22px;
		font-weight: var(--font-weight-bold);
		letter-spacing: 4px;
	}
	.results-layout {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 24px;
	}
	.score-panel {
		text-align: center;
		padding: 35px;
	}
	.score-circle {
		--ring: var(--color-gold);
		width: 215px;
		height: 215px;
		display: grid;
		place-items: center;
		border-radius: 50%;
		background: conic-gradient(var(--ring) var(--score), var(--color-border-subtle) 0);
		margin: 30px auto;
	}
	.score-circle.passed {
		--ring: var(--color-success);
	}
	.score-circle > div {
		width: 193px;
		height: 193px;
		background: var(--color-surface);
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		flex-direction: column;
	}
	.score-circle strong {
		font-family: var(--font-display);
		font-size: 76px;
		font-weight: var(--font-weight-bold);
		letter-spacing: -4px;
	}
	.score-circle strong span {
		font-size: 26px;
		color: var(--color-text-faint);
		letter-spacing: -1px;
	}
	.score-circle small {
		color: var(--color-text-secondary);
		font-size: var(--font-size-caption);
		font-weight: var(--font-weight-semibold);
	}
	.score-panel > .study-muted {
		margin: 15px 0 0;
		font-size: var(--font-size-caption);
	}
	.result-details {
		display: grid;
		gap: 24px;
	}
	.earned {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 20px;
	}
	.earned strong,
	.community > strong {
		font-family: var(--font-display);
		font-size: 54px;
		font-weight: var(--font-weight-bold);
		letter-spacing: -2px;
	}
	.earned strong span,
	.community > strong span {
		font-size: 20px;
		color: var(--color-text-secondary);
	}
	.earned p {
		margin-bottom: 0;
	}
	.community h2 {
		font-size: 19px;
		margin-top: 8px;
	}
	.community-bar {
		height: 12px;
		margin: 20px 0 12px;
		border-radius: var(--radius-full);
		background: var(--color-border-subtle);
		overflow: hidden;
	}
	.community-bar span {
		display: block;
		height: 100%;
		border-radius: var(--radius-full);
		background: var(--color-success);
	}
	.community small {
		color: var(--color-text-faint);
		font-size: var(--font-size-caption);
	}
	.dashboard-link {
		margin-left: auto;
		font-size: var(--font-size-small);
		font-weight: var(--font-weight-semibold);
	}
	@media (max-width: 750px) {
		.verdict {
			grid-template-columns: 1fr;
			padding: 24px;
			text-align: center;
			justify-items: center;
		}
		.verdict-art {
			width: 180px;
		}
	}
	@media (max-width: 650px) {
		.results-layout {
			grid-template-columns: 1fr;
		}
		.dashboard-link {
			margin-left: 0;
		}
	}
</style>
