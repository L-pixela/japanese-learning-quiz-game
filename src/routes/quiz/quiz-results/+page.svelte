<script lang="ts">
	import { resolve } from '$app/paths'
	import Badge from '$lib/components/badge.svelte'
	import Button from '$lib/components/button.svelte'
	import QuizRankPanel from '$lib/components/quiz-rank-panel.svelte'
	import QuizResultMetric from '$lib/components/quiz-result-metric.svelte'
	import QuizStreakBanner from '$lib/components/quiz-streak-banner.svelte'

	type QuizResult = {
		pointsEarned: number
		user: {
			points: number
			streak: number
			rank: string
		}
	}

	const quizResult: QuizResult = {
		pointsEarned: 80,
		user: {
			points: 1280,
			streak: 7,
			rank: 'mentaiko',
		},
	}

	let showToast = $state(false)

	function startAnotherQuiz() {
		showToast = true
		window.setTimeout(() => (showToast = false), 2400)
	}
</script>

<svelte:head>
	<title>Quiz results / クイズ結果 | TanTore</title>
	<meta
		name="description"
		content="Quiz points, streak, and rank results / クイズのポイント、連続日数、ランク結果"
	/>
</svelte:head>

<main class="results-page">
	<header class="results-header">
		<a class="brand-mark" href={resolve('/', {})} aria-label="TanTore home">
			<span class="brand-seal">単</span>
			<span>TanTore</span>
		</a>
		<div class="header-meta">
			<span class="eyebrow">QUIZ COMPLETE / クイズ完了</span>
			<span class="header-divider" aria-hidden="true"></span>
			<span>Quiz results / クイズ結果</span>
		</div>
	</header>

	<section class="results-shell" aria-labelledby="results-title">
		<div class="intro-row">
			<div>
				<p class="kicker">おつかれさま / Nice work</p>
				<h1 id="results-title">Quiz complete / クイズ完了</h1>
				<p class="intro-copy">Your results are ready. / 結果が出ました。</p>
			</div>
			<Badge variant="success">Completed / 完了</Badge>
		</div>

		<div class="results-grid">
			<section class="score-panel" aria-label="Points earned / 獲得ポイント">
				<div class="score-ring points-ring">
					<div class="score-ring-inner">
						<strong>+{quizResult.pointsEarned}</strong><span>pt</span>
					</div>
				</div>
				<div class="score-copy">
					<span class="metric-label">POINTS EARNED / 獲得ポイント</span>
					<h2>Great job! / よくできました！</h2>
					<p>Added to your total points. / 累計ポイントに加算されました。</p>
				</div>
			</section>

			<div class="metric-stack">
				<QuizResultMetric
					label="POINTS EARNED / 獲得ポイント"
					value="+{quizResult.pointsEarned}"
					note="This quiz / 今回のクイズ"
					icon="＋"
					compact
				/>
				<QuizResultMetric
					label="TOTAL POINTS / 累計ポイント"
					value={quizResult.user.points}
					note="Your account total / アカウントの合計"
					icon="✓"
					tone="success"
					compact
				/>
			</div>
		</div>

		<QuizStreakBanner streak={quizResult.user.streak} compact />

		<div class="lower-grid">
			<QuizRankPanel streak={quizResult.user.streak} compact />
		</div>

		<div class="actions">
			<Button variant="primary" size="lg" onclick={startAnotherQuiz}
				>Start another quiz / もう一度クイズ <span aria-hidden="true">→</span></Button
			>
			<a class="secondary-action" href={resolve('/', {})}>Back home / ホームへ戻る</a>
		</div>
	</section>

	{#if showToast}<div class="toast" role="status">
			Ready for another quiz. / 次のクイズの準備ができました。
		</div>{/if}
</main>

<style>
	.results-page {
		min-height: 100vh;
		padding: 0.75rem clamp(1rem, 4vw, 4rem) 1.5rem;
		background:
			radial-gradient(circle at 87% 8%, rgba(198, 75, 107, 0.12), transparent 20rem),
			linear-gradient(135deg, rgba(255, 250, 240, 0.7), transparent 45%), var(--color-background);
	}
	.results-header,
	.results-shell {
		width: min(100%, 68rem);
		margin: 0 auto;
	}
	.results-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
		padding-bottom: 1.25rem;
		border-bottom: 1px solid var(--color-border-subtle);
	}
	.header-meta {
		display: flex;
		align-items: center;
		gap: 0.8rem;
		color: var(--color-text-secondary);
		font-size: 0.78rem;
		font-weight: 750;
	}
	.eyebrow,
	.kicker,
	.metric-label {
		letter-spacing: 0.1em;
		font-size: 0.7rem;
		font-weight: 900;
	}
	.eyebrow,
	.kicker {
		color: var(--color-accent);
	}
	.header-divider {
		width: 1px;
		height: 1rem;
		background: var(--color-border);
	}
	.results-shell {
		margin-top: clamp(1rem, 3vw, 2rem);
	}
	.intro-row {
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		gap: 1rem;
	}
	.kicker {
		margin: 0 0 0.75rem;
	}
	h1,
	h2,
	p {
		margin-top: 0;
	}
	h1 {
		margin-bottom: 0.6rem;
		font-size: clamp(2rem, 4vw, 3rem);
		line-height: 0.98;
		letter-spacing: -0.04em;
	}
	.intro-copy {
		margin: 0;
		color: var(--color-text-secondary);
		font-size: 1.05rem;
	}
	.results-grid {
		display: grid;
		grid-template-columns: minmax(0, 1.35fr) minmax(17rem, 0.65fr);
		gap: 1rem;
		margin-top: 1.25rem;
	}
	.score-panel {
		border: 1px solid var(--color-border);
		background: var(--color-surface-raised);
		box-shadow: var(--shadow-sm);
	}
	.score-panel {
		display: flex;
		align-items: center;
		gap: clamp(1rem, 3vw, 2rem);
		padding: var(--spacing-lg);
		border-radius: var(--radius-lg);
		background: linear-gradient(
			125deg,
			var(--color-surface-raised) 0%,
			var(--color-background) 100%
		);
	}
	.score-ring {
		position: relative;
		display: grid;
		place-items: center;
		width: clamp(8rem, 17vw, 11.5rem);
		aspect-ratio: 1;
		flex: 0 0 auto;
		border-radius: 50%;
		background: conic-gradient(var(--color-primary) var(--score-angle), var(--color-border) 0);
		animation: score-in 700ms var(--ease-out) both;
	}
	.points-ring {
		background: conic-gradient(var(--color-primary) 100%, var(--color-border) 0);
	}
	.score-ring::after {
		content: '';
		position: absolute;
		inset: 0.65rem;
		border-radius: 50%;
		background: var(--color-surface);
	}
	.score-ring-inner {
		z-index: 1;
		display: flex;
		align-items: baseline;
		gap: 0.15rem;
	}
	.score-ring strong {
		font-size: clamp(2.5rem, 6vw, 4rem);
		line-height: 1;
	}
	.score-ring span {
		color: var(--color-text-secondary);
		font-size: 0.8rem;
		font-weight: 800;
	}
	.score-copy h2 {
		margin: 0.45rem 0 0.3rem;
		font-size: clamp(1.7rem, 3vw, 2.35rem);
	}
	.score-copy p {
		margin: 0;
		color: var(--color-text-secondary);
	}
	.metric-stack {
		display: grid;
		gap: var(--spacing-md);
	}
	.lower-grid {
		display: grid;
		grid-template-columns: minmax(0, 1fr);
		gap: var(--spacing-md);
		margin-top: var(--spacing-md);
	}
	.actions {
		display: flex;
		align-items: center;
		gap: var(--spacing-md);
		margin-top: var(--spacing-md);
	}
	.actions :global(.button) {
		box-shadow: 0 4px 0 var(--color-primary-active);
	}
	.actions :global(.button span) {
		margin-left: 0.6rem;
	}
	.secondary-action {
		color: var(--color-text-secondary);
		font-size: 0.85rem;
		font-weight: 800;
		text-decoration: none;
	}
	.secondary-action:hover {
		color: var(--color-text);
	}
	.toast {
		position: fixed;
		right: 1.25rem;
		bottom: 1.25rem;
		padding: 0.9rem 1.1rem;
		border: 1px solid var(--color-primary-active);
		border-radius: var(--radius-md);
		background: var(--color-primary);
		color: #fff;
		box-shadow: var(--shadow-md);
		font-size: 0.85rem;
		font-weight: 750;
		animation: toast-in 220ms var(--ease-out) both;
	}
	@keyframes score-in {
		from {
			opacity: 0;
			transform: scale(0.75) rotate(-18deg);
		}
		to {
			opacity: 1;
			transform: scale(1) rotate(0);
		}
	}
	@keyframes toast-in {
		from {
			opacity: 0;
			transform: translateY(0.5rem);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}
	@media (prefers-reduced-motion: reduce) {
		*,
		*::before,
		*::after {
			animation-duration: 0.01ms !important;
			animation-iteration-count: 1 !important;
			scroll-behavior: auto !important;
		}
	}
	@media (max-width: 760px) {
		.results-page {
			padding-inline: 0.85rem;
		}
		.results-header {
			align-items: flex-start;
		}
		.header-meta {
			flex-direction: column;
			align-items: flex-end;
			gap: 0.2rem;
			text-align: right;
		}
		.header-divider {
			display: none;
		}
		.results-grid,
		.lower-grid {
			grid-template-columns: 1fr;
		}
		.score-panel {
			align-items: flex-start;
		}
	}
	@media (max-width: 480px) {
		h1 {
			font-size: 2.35rem;
		}
		.intro-row {
			align-items: flex-start;
		}
		.intro-row :global(.badge) {
			margin-top: 0.2rem;
		}
		.score-panel {
			flex-direction: column;
			align-items: center;
			text-align: center;
		}
		.score-copy {
			width: 100%;
		}
		.actions {
			flex-direction: column;
			align-items: stretch;
			text-align: center;
		}
	}
</style>
