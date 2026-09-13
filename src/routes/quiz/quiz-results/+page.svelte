<script lang="ts">
	import { resolve } from '$app/paths'
	import StudyShell from '$lib/components/StudyShell.svelte'
	import { LEVELS } from '$lib/levels'
	import type { PageData } from './$types'
	let { data }: { data: PageData } = $props()
	let result = $derived(data.result)
</script>

<svelte:head><title>Your quiz results · TanTore</title></svelte:head>
<StudyShell>
	{#if result}
		<div class="study-heading">
			<div>
				<p class="study-eyebrow">Practice complete / おつかれさま</p>
				<h1>{result.passed ? 'One step further.' : 'Every attempt is progress.'}</h1>
				<p class="study-muted">
					{result.passed
						? 'You passed this level. Take that feeling into the next one.'
						: 'A few more words to get familiar with. You can try again anytime.'}
				</p>
			</div>
			<span class="study-stamp" lang="ja">{result.passed ? '合格' : '復習'}</span>
		</div>
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
		--ring: #c8a244;
		width: 215px;
		height: 215px;
		display: grid;
		place-items: center;
		border-radius: 50%;
		background: conic-gradient(var(--ring) var(--score), #e3e5d9 0);
		margin: 30px auto;
	}
	.score-circle.passed {
		--ring: #37664d;
	}
	.score-circle > div {
		width: 193px;
		height: 193px;
		background: #fcfaf3;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		flex-direction: column;
	}
	.score-circle strong {
		font-size: 70px;
		font-weight: 400;
		letter-spacing: -4px;
	}
	.score-circle strong span {
		font-size: 23px;
		color: #7e8777;
		letter-spacing: -1px;
	}
	.score-circle small {
		font-size: 9px;
		letter-spacing: 1.5px;
		color: #62695f;
	}
	.score-panel > .study-muted {
		margin: 15px 0 0;
		font-size: 12px;
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
		font-size: 52px;
		font-weight: 400;
		letter-spacing: -2px;
	}
	.earned strong span,
	.community > strong span {
		font-size: 20px;
		color: #62695f;
	}
	.earned p {
		margin-bottom: 0;
	}
	.community h2 {
		font-size: 19px;
		margin-top: 8px;
	}
	.community-bar {
		height: 5px;
		background: #e3e5d9;
		margin: 20px 0 12px;
	}
	.community-bar span {
		display: block;
		height: 100%;
		background: #37664d;
	}
	.community small {
		font-size: 10px;
		color: #62695f;
	}
	.dashboard-link {
		font-size: 12px;
		margin-left: auto;
		text-decoration: none;
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
