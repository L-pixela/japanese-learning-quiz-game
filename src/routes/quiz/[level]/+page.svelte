<script lang="ts">
	import { onMount, untrack } from 'svelte'
	import { goto } from '$app/navigation'
	import { resolve } from '$app/paths'
	import StudyShell from '$lib/components/StudyShell.svelte'
	import { t } from '$lib/i18n.svelte'
	import type { PageData } from './$types'
	let { data }: { data: PageData } = $props()
	type Quiz = {
		attemptId: string
		questions: Array<{ japanese: string; reading: string; options: string[] }>
	}
	type QuizResult = {
		level: number
		score: number
		passed: boolean
		pointsEarned: number
		completion: { completedUsers: number; totalUsers: number; percentage: number }
		user: { points: number; streak: number }
	}
	let quiz = $state<Quiz | null>(null)
	let result = $state<QuizResult | null>(null)
	let answers = $state<number[]>(Array(10).fill(-1))
	let current = $state(0)
	let busy = $state(false)
	let error = $state('')
	let question = $derived(quiz?.questions[current])
	async function start() {
		busy = true
		error = ''
		try {
			const response = await fetch('/api/quiz/start', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ level: data.level.level }),
			})
			if (response.status === 401) {
				await goto(resolve('/login', {}))
				return
			}
			const started = (await response.json()) as Quiz & { error?: string }
			if (!response.ok) throw new Error(started.error ?? 'Unable to start quiz.')
			quiz = started
			current = 0
			answers = Array(10).fill(-1)
		} catch (e) {
			error = e instanceof Error ? e.message : 'Unable to connect. Please try again.'
		} finally {
			busy = false
		}
	}
	async function submit() {
		if (!quiz || busy || answers.some((answer) => answer < 0)) return
		busy = true
		error = ''
		try {
			const response = await fetch('/api/quiz/submit', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ attemptId: quiz.attemptId, answers }),
			})
			if (response.status === 401) {
				await goto(resolve('/login', {}))
				return
			}
			const graded = (await response.json()) as QuizResult & { error?: string }
			if (!response.ok) throw new Error(graded.error ?? 'Unable to save your answers.')
			// Submit already returns the graded result, so the summary opens without a round trip.
			result = graded
		} catch (e) {
			error =
				e instanceof Error
					? e.message
					: 'Unable to connect. Your answers are still here; try again.'
		} finally {
			busy = false
		}
	}
	onMount(() => {
		void start()
	})
	// "Next quiz" only changes the route param, so the component is reused.
	// Watch the level and deal a fresh set of words whenever it moves.
	let loadedLevel = untrack(() => data.level.level)
	$effect(() => {
		const level = data.level.level
		if (level === loadedLevel) return
		loadedLevel = level
		result = null
		quiz = null
		void start()
	})
	async function nextQuiz() {
		await goto(resolve('/quiz/[level]', { level: String(data.level.level + 1) }))
	}
	function retry() {
		result = null
		void start()
	}
</script>

<svelte:head><title>Level {data.level.level} · TanTore</title></svelte:head>
<StudyShell>
	<div class="quiz-top">
		<a href={resolve('/quiz', {})}>← {t('quiz.backToMap')}</a><span
			>Level {String(data.level.level).padStart(2, '0')} · {data.level.difficulty}</span
		>
	</div>
	<section class="quiz-sheet">
		<p class="study-eyebrow">{data.level.name} / {data.level.japanese}</p>
		{#if quiz && question}
			<div class="question-meta">
				<span>{t('quiz.question')} {String(current + 1).padStart(2, '0')} / 10</span><span
					>{t('quiz.chooseMeaning')}</span
				>
			</div>
			<progress value={current + 1} max="10" aria-label="Question progress"></progress>
			<div class="word-prompt" aria-live="polite">
				<p lang="ja">{question.reading}</p>
				<h1 lang="ja">{question.japanese}</h1>
				<span>{t('quiz.whatMeans')}</span>
			</div>
			<fieldset disabled={busy}>
				<legend class="sr-only">Answer for {question.japanese}</legend>
				<div class="options">
					{#each question.options as option, index (current + ':' + index)}<label
							class:selected={answers[current] === index}
							><input
								type="radio"
								name={'question-' + current}
								value={index}
								bind:group={answers[current]}
							/><span class="option-letter">{String.fromCharCode(65 + index)}</span><span
								>{option}</span
							></label
						>{/each}
				</div>
			</fieldset>
			<div class="quiz-controls">
				<button
					class="study-button secondary"
					disabled={current === 0 || busy}
					onclick={() => current--}>← {t('quiz.back')}</button
				><span>{t('quiz.answered', { done: answers.filter((answer) => answer >= 0).length })}</span
				>{#if current < 9}<button
						class="study-button"
						disabled={answers[current] < 0 || busy}
						onclick={() => current++}>{t('quiz.next')} →</button
					>{:else}<button
						class="study-button"
						disabled={busy || answers.some((answer) => answer < 0)}
						onclick={submit}>{busy ? t('quiz.saving') : t('quiz.finish') + ' ↗'}</button
					>{/if}
			</div>
		{:else}<div class="loading">
				<h1>{busy ? t('quiz.opening') : t('quiz.ready')}</h1>
				<p class="study-muted">{t('quiz.readyLead')}</p>
				{#if !busy}<button class="study-button" onclick={start}>{t('quiz.tryAgain')}</button>{/if}
			</div>{/if}
		{#if error}<p class="study-error" role="alert">{error}</p>{/if}
	</section>
	<p class="quiz-note">{t('quiz.note')}</p>

	{#if result}
		<div class="result-backdrop">
			<div
				class={'result-card ' + (result.passed ? 'passed' : 'failed')}
				role="dialog"
				aria-modal="true"
				aria-labelledby="result-title"
			>
				<div class="result-art">
					<img
						src={result.passed ? '/team/pass.png' : '/team/fail.png'}
						alt=""
						aria-hidden="true"
					/>
					<span class="result-stamp" lang="ja"
						>{result.passed ? t('result.passStamp') : t('result.failStamp')}</span
					>
				</div>
				<h2 id="result-title">
					{result.passed
						? t('result.passedTitle', { level: String(result.level).padStart(2, '0') })
						: t('result.failedTitle')}
				</h2>
				<p class="result-lead">
					{result.passed ? t('result.passedLead') : t('result.failedLead')}
				</p>
				<div class="result-stats">
					<div>
						<strong>{result.score}<span>/10</span></strong><small>{t('result.correct')}</small>
					</div>
					<div>
						<strong>+{result.pointsEarned}</strong><small>{t('result.pointsEarned')}</small>
					</div>
					<div>
						<strong>{result.completion.completedUsers}</strong><small
							>{t('result.learnersPassed')}<br />{t('result.outOf', {
								total: result.completion.totalUsers,
							})}</small
						>
					</div>
				</div>
				<div class="result-actions">
					{#if result.passed && result.level < 10}
						<button class="study-button" onclick={nextQuiz}>{t('result.nextQuiz')} →</button>
					{:else}
						<button class="study-button" onclick={retry}
							>{result.passed ? t('result.practiceAgain') : t('quiz.tryAgain')}</button
						>
					{/if}
					<a
						class="study-button secondary"
						href={resolve('/deck_list', {}) + '?level=' + result.level}
						>{t('result.continueStudy')}</a
					>
				</div>
			</div>
		</div>
	{/if}
</StudyShell>

<style>
	.quiz-top {
		display: flex;
		justify-content: space-between;
		gap: 15px;
		font-size: var(--font-size-caption);
		margin-bottom: 25px;
		color: var(--color-text-secondary);
	}
	.quiz-top a {
		text-decoration: none;
	}
	.quiz-sheet {
		width: min(820px, 100%);
		margin: auto;
		padding: clamp(24px, 5vw, 46px);
		border-radius: var(--radius-xl);
		background: var(--color-surface);
		box-shadow: var(--shadow-md);
	}
	.question-meta {
		display: flex;
		justify-content: space-between;
		gap: 12px;
		font-size: var(--font-size-caption);
		color: var(--color-text-secondary);
		margin: 25px 0 12px;
	}
	progress {
		display: block;
		width: 100%;
		height: 14px;
		border: 0;
		border-radius: var(--radius-full);
		accent-color: var(--color-primary);
	}
	progress::-webkit-progress-bar {
		border-radius: var(--radius-full);
		background: var(--color-surface-sunken);
	}
	progress::-webkit-progress-value {
		border-radius: var(--radius-full);
		background: var(--color-primary);
	}
	.word-prompt {
		text-align: center;
		padding: 38px 0;
	}
	.word-prompt p {
		font-size: var(--font-size-body);
		letter-spacing: 3px;
		margin-bottom: 10px;
		color: var(--color-text-secondary);
	}
	.word-prompt h1 {
		margin-bottom: 18px;
		font-family: var(--font-display);
		font-size: clamp(44px, 8vw, 76px);
		letter-spacing: 4px;
		overflow-wrap: anywhere;
	}
	.word-prompt > span {
		font-size: var(--font-size-caption);
		color: var(--color-text-secondary);
	}
	fieldset {
		border: 0;
		padding: 0;
		margin: 0;
		min-width: 0;
	}
	.options {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 12px;
	}
	.options label {
		position: relative;
		display: flex;
		gap: 14px;
		align-items: center;
		min-height: 82px;
		padding: 18px 20px;
		border-radius: var(--radius-md);
		background: var(--color-surface-sunken);
		box-shadow: var(--shadow-solid) var(--color-border);
		font-size: var(--font-size-body);
		font-weight: var(--font-weight-medium);
		cursor: pointer;
		transition: transform var(--duration-fast) var(--ease-standard);
	}
	.options label:hover {
		background: var(--color-primary-soft);
	}
	.options input {
		position: absolute;
		opacity: 0;
		width: 1px;
	}
	.options label:has(input:focus-visible) {
		outline: 3px solid var(--color-primary);
		outline-offset: 3px;
	}
	.options label.selected {
		background: var(--color-primary-soft);
		box-shadow: var(--shadow-solid) var(--color-primary);
		transform: translateY(-1px);
	}
	.option-letter {
		display: grid;
		place-items: center;
		flex-shrink: 0;
		width: 36px;
		height: 36px;
		border-radius: var(--radius-full);
		background: var(--color-surface);
		color: var(--color-text-secondary);
		font-family: var(--font-display);
		font-size: var(--font-size-small);
		font-weight: var(--font-weight-bold);
	}
	.selected .option-letter {
		background: var(--color-primary);
		color: var(--color-on-primary);
	}
	.quiz-controls {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 12px;
		margin-top: 30px;
	}
	.quiz-controls > span {
		font-size: var(--font-size-caption);
		color: var(--color-text-secondary);
	}
	.quiz-note {
		text-align: center;
		color: var(--color-text-secondary);
		font-size: var(--font-size-caption);
		margin-top: 22px;
	}
	.result-backdrop {
		position: fixed;
		inset: 0;
		z-index: var(--z-modal);
		display: grid;
		place-items: center;
		padding: 20px;
		background: rgba(20, 25, 17, 0.66);
		backdrop-filter: blur(3px);
		animation: fade var(--duration-base) var(--ease-out);
	}
	.result-card {
		width: min(520px, 100%);
		max-height: 92vh;
		overflow-y: auto;
		padding: 0 34px 34px;
		border-radius: var(--radius-xl);
		background: var(--color-surface);
		box-shadow: var(--shadow-lg);
		text-align: center;
		animation: pop var(--duration-slow) var(--ease-out);
	}
	.result-art {
		position: relative;
		margin: -1px -34px 22px;
		padding: 30px 0;
		border-radius: var(--radius-xl) var(--radius-xl) 0 0;
		background: linear-gradient(120deg, var(--color-primary) 0%, var(--color-secondary) 100%);
	}
	.failed .result-art {
		background: var(--color-danger);
	}
	.result-art img {
		width: 148px;
		margin: 14px;
		height: 148px;
		border-radius: var(--radius-full);
		border: 5px solid #fff;
		object-fit: cover;
		object-position: center 25%;
	}
	.result-stamp {
		position: absolute;
		right: 34px;
		bottom: 26px;
		padding: 9px 18px;
		border-radius: var(--radius-full);
		background: var(--color-surface);
		color: var(--color-primary-active);
		box-shadow: var(--shadow-solid) rgba(20, 25, 17, 0.22);
		font-family: var(--font-display);
		font-size: 20px;
		font-weight: var(--font-weight-bold);
		letter-spacing: 3px;
	}
	.result-card h2 {
		font-size: clamp(20px, 3.3vw, 30px);
	}
	.result-lead {
		margin: 10px 0 0;
		color: var(--color-text-secondary);
		font-size: var(--font-size-small);
		line-height: var(--line-height-relaxed);
	}
	.result-stats {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 10px;
		margin: 24px 0;
		padding: 20px 0;
		border-radius: var(--radius-lg);
		background: var(--color-surface-sunken);
	}
	.result-stats strong {
		display: block;
		font-family: var(--font-display);
		font-size: clamp(21px, 3.6vw, 32px);
		font-weight: var(--font-weight-bold);
		letter-spacing: -1px;
	}
	.result-stats strong span {
		font-size: var(--font-size-body);
		color: var(--color-text-faint);
	}
	.result-stats small {
		display: block;
		margin-top: 4px;
		color: var(--color-text-secondary);
		font-size: var(--font-size-caption);
		line-height: 1.4;
	}
	.result-actions {
		display: grid;
		gap: 12px;
	}
	@keyframes pop {
		from {
			transform: scale(0.9) translateY(14px);
			opacity: 0;
		}
	}
	@keyframes fade {
		from {
			opacity: 0;
		}
	}
	@media (prefers-reduced-motion: reduce) {
		.result-card,
		.result-backdrop {
			animation: none;
		}
	}
	.loading {
		padding: 45px 0;
	}
	.study-error {
		margin-top: 20px;
	}
	@media (max-width: 550px) {
		.options {
			grid-template-columns: 1fr;
		}
		.quiz-controls > span {
			display: none;
		}
		.quiz-controls .study-button {
			padding: 13px 16px;
		}
	}
</style>
