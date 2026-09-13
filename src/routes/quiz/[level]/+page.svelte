<script lang="ts">
	import { onMount } from 'svelte'
	import { goto } from '$app/navigation'
	import { resolve } from '$app/paths'
	import StudyShell from '$lib/components/StudyShell.svelte'
	import type { PageData } from './$types'
	let { data }: { data: PageData } = $props()
	type Quiz = {
		attemptId: string
		questions: Array<{ japanese: string; reading: string; options: string[] }>
	}
	let quiz = $state<Quiz | null>(null)
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
			const result = (await response.json()) as Quiz & { error?: string }
			if (!response.ok) throw new Error(result.error ?? 'Unable to start quiz.')
			quiz = result
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
			const result = (await response.json()) as Quiz & { error?: string }
			if (!response.ok) throw new Error(result.error ?? 'Unable to save your answers.')
			await goto(
				resolve('/quiz/quiz-results', {}) + '?attempt=' + encodeURIComponent(quiz.attemptId),
			)
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
</script>

<svelte:head><title>Level {data.level.level} · TanTore</title></svelte:head>
<StudyShell>
	<div class="quiz-top">
		<a href={resolve('/quiz', {})}>← Level map</a><span
			>Level {String(data.level.level).padStart(2, '0')} · {data.level.difficulty}</span
		>
	</div>
	<section class="quiz-sheet">
		<p class="study-eyebrow">{data.level.name} / {data.level.japanese}</p>
		{#if quiz && question}
			<div class="question-meta">
				<span>QUESTION {String(current + 1).padStart(2, '0')} / 10</span><span
					>Choose the meaning</span
				>
			</div>
			<progress value={current + 1} max="10" aria-label="Question progress"></progress>
			<div class="word-prompt" aria-live="polite">
				<p lang="ja">{question.reading}</p>
				<h1 lang="ja">{question.japanese}</h1>
				<span>What does this word mean?</span>
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
					onclick={() => current--}>← Back</button
				><span>{answers.filter((answer) => answer >= 0).length} of 10 answered</span
				>{#if current < 9}<button
						class="study-button"
						disabled={answers[current] < 0 || busy}
						onclick={() => current++}>Next word →</button
					>{:else}<button
						class="study-button"
						disabled={busy || answers.some((answer) => answer < 0)}
						onclick={submit}>{busy ? 'Saving…' : 'Finish quiz ↗'}</button
					>{/if}
			</div>
		{:else}<div class="loading">
				<h1>{busy ? 'Opening your practice…' : 'Ready when you are.'}</h1>
				<p class="study-muted">Ten words. Take your time.</p>
				{#if !busy}<button class="study-button" onclick={start}>Try again</button>{/if}
			</div>{/if}
		{#if error}<p class="study-error" role="alert">{error}</p>{/if}
	</section>
	<p class="quiz-note">6 correct answers to pass · 1 point per correct answer</p>
</StudyShell>

<style>
	.quiz-top {
		display: flex;
		justify-content: space-between;
		gap: 15px;
		font-size: 12px;
		margin-bottom: 25px;
		color: #62695f;
	}
	.quiz-top a {
		text-decoration: none;
	}
	.quiz-sheet {
		width: min(780px, 100%);
		margin: auto;
		border: 1px solid #d9d9cb;
		background: #fcfaf3;
		padding: clamp(22px, 5vw, 45px);
	}
	.question-meta {
		display: flex;
		justify-content: space-between;
		gap: 12px;
		font-size: 10px;
		color: #62695f;
		margin: 25px 0 12px;
	}
	progress {
		height: 4px;
		width: 100%;
		accent-color: #aa4235;
		display: block;
	}
	.word-prompt {
		text-align: center;
		padding: 38px 0;
	}
	.word-prompt p {
		font-size: 17px;
		letter-spacing: 3px;
		margin-bottom: 10px;
		color: #62695f;
	}
	.word-prompt h1 {
		font-family: 'Yu Mincho', serif;
		font-size: clamp(35px, 7vw, 60px);
		overflow-wrap: anywhere;
		letter-spacing: 5px;
		margin-bottom: 18px;
	}
	.word-prompt > span {
		font-size: 12px;
		color: #62695f;
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
		cursor: pointer;
		display: flex;
		gap: 14px;
		align-items: center;
		padding: 18px;
		border: 1px solid #d9d9cb;
		font-size: 13px;
		min-height: 76px;
		position: relative;
	}
	.options input {
		position: absolute;
		opacity: 0;
		width: 1px;
	}
	.options label:has(input:focus-visible) {
		outline: 3px solid #aa4235;
		outline-offset: 3px;
	}
	.options label.selected {
		border-color: #37664d;
		background: #eaf0e3;
	}
	.option-letter {
		border: 1px solid #d9d9cb;
		width: 28px;
		height: 28px;
		display: grid;
		place-items: center;
		flex-shrink: 0;
		font-size: 11px;
	}
	.selected .option-letter {
		background: #37664d;
		color: white;
		border-color: #37664d;
	}
	.quiz-controls {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 12px;
		margin-top: 30px;
	}
	.quiz-controls > span {
		font-size: 10px;
		color: #62695f;
	}
	.quiz-note {
		text-align: center;
		color: #62695f;
		font-size: 11px;
		margin-top: 22px;
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
