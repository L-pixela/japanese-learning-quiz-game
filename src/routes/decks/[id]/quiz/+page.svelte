<script lang="ts">
	import { resolve } from '$app/paths'
	import { page } from '$app/state'

	type Question = {
		id: string
		front: string
		back: string
	}

	let questions = $state<Question[]>([])
	let questionIndex = $state(0)
	let selectedAnswer = $state('')
	let correctCount = $state(0)
	let loading = $state(true)
	let error = $state('')
	let finished = $state(false)
	let previewMode = $state(false)

	const previewQuestions: Question[] = [
		{ id: 'preview-1', front: '辛い', back: 'spicy / hot (taste)' },
		{ id: 'preview-2', front: '甘い', back: 'sweet' },
		{ id: 'preview-3', front: '酸っぱい', back: 'sour' },
		{ id: 'preview-4', front: '苦い', back: 'bitter' },
	]

	const currentQuestion = $derived(questions[questionIndex])
	const choices = $derived(currentQuestion ? getChoices(currentQuestion) : [])
	const isAnswered = $derived(selectedAnswer.length > 0)
	const isCorrect = $derived(selectedAnswer === currentQuestion?.back)
	const progress = $derived(
		questions.length > 0 ? `${questionIndex + 1} / ${questions.length}` : '',
	)

	function getChoices(question: Question): string[] {
		const otherAnswers = questions
			.filter((item) => item.id !== question.id)
			.map((item) => item.back)
		return [...new Set([question.back, ...otherAnswers])]
			.slice(0, 4)
			.sort(() => Math.random() - 0.5)
	}

	function chooseAnswer(answer: string) {
		if (isAnswered) return
		selectedAnswer = answer
		if (answer === currentQuestion.back) correctCount += 1
	}

	function nextQuestion() {
		if (!isAnswered) return
		if (questionIndex === questions.length - 1) {
			finished = true
			return
		}
		questionIndex += 1
		selectedAnswer = ''
	}

	function restartQuiz() {
		questionIndex = 0
		selectedAnswer = ''
		correctCount = 0
		finished = false
	}

	async function loadQuiz() {
		loading = true
		error = ''
		try {
			const response = await fetch(`/api/decks/${page.params.id}/quiz?count=10`)
			const data = (await response.json()) as { questions?: Question[]; error?: string }
			if (!response.ok || !data.questions) {
				if (data.error === 'deck has no cards to quiz') {
					questions = previewQuestions
					previewMode = true
					return
				}
				error = data.error ?? 'Unable to load this quiz.'
				return
			}
			questions = data.questions
		} catch {
			error = 'Unable to connect. Please try again.'
		} finally {
			loading = false
		}
	}

	loadQuiz()
</script>

<svelte:head>
	<title>Quiz | TanTore</title>
</svelte:head>

<main class="quiz-page">
	<section class="quiz-shell" aria-labelledby="quiz-title">
		<header class="quiz-header">
			<a class="brand-mark" href={resolve('/', {})} aria-label="TanTore home">
				<span class="brand-seal">単</span>
				<span>TanTore</span>
			</a>
			<div class="quiz-meta">
				<span>QUIZ TIME / クイズの時間</span>
				{#if progress}<strong>{progress}</strong>{/if}
			</div>
		</header>

		{#if loading}
			<div class="state-panel" role="status">Loading quiz... / クイズを読み込み中...</div>
		{:else if error}
			<div class="state-panel error-panel" role="alert">
				<p>{error}</p>
				<a class="secondary-button" href={resolve('/', {})}>Back to library / ライブラリへ</a>
			</div>
		{:else if finished}
			<div class="result-panel">
				<p class="caption">QUIZ COMPLETE / クイズ完了</p>
				<h1 id="quiz-title">Nice work!</h1>
				<p class="score">{correctCount} <span>/ {questions.length} correct</span></p>
				<p>Keep practicing to grow your rank.</p>
				<div class="result-actions">
					<button type="button" onclick={restartQuiz}>Try again / もう一度</button>
					<a class="secondary-button" href={resolve('/', {})}>Back to library / ライブラリへ</a>
				</div>
			</div>
		{:else if currentQuestion}
			<div class="quiz-content">
				{#if previewMode}
					<p class="preview-notice" role="status">
						Preview questions are shown because this deck has no cards yet.
					</p>
				{/if}
				<div class="question-card">
					<p class="question-label">Choose the meaning / 意味を選ぶ</p>
					<h1 id="quiz-title">{currentQuestion.front}</h1>
					{#if isAnswered}
						<p class:correct={isCorrect} class:incorrect={!isCorrect} class="feedback">
							{isCorrect ? 'Correct — よくできました！' : `Answer: ${currentQuestion.back}`}
						</p>
					{:else}
						<p class="hint">Select the best answer below.</p>
					{/if}
				</div>

				<div class="choices" role="group" aria-label="Answer choices">
					{#each choices as choice (choice)}
						<button
							type="button"
							class:selected={selectedAnswer === choice}
							class:correct-choice={isAnswered && choice === currentQuestion.back}
							class:wrong-choice={selectedAnswer === choice && !isCorrect}
							disabled={isAnswered}
							onclick={() => chooseAnswer(choice)}
						>
							{choice}
						</button>
					{/each}
				</div>

				<button class="next-button" type="button" disabled={!isAnswered} onclick={nextQuestion}>
					{questionIndex === questions.length - 1
						? 'FINISH QUIZ / クイズを終える'
						: 'NEXT QUESTION / 次の問題'}
				</button>
			</div>
		{/if}
	</section>
</main>

<style>
	.quiz-page {
		min-height: 100vh;
		padding: clamp(1rem, 4vw, 3rem);
		background: var(--color-background);
	}

	.quiz-shell {
		width: min(100%, 48rem);
		margin: 0 auto;
	}

	.quiz-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
		margin-bottom: 1.5rem;
	}

	.quiz-meta {
		display: grid;
		gap: 0.3rem;
		color: var(--color-text-secondary);
		font-size: 0.75rem;
		font-weight: 900;
		letter-spacing: 0.08em;
		text-align: right;
	}

	.quiz-meta strong {
		color: var(--color-text);
		font-size: 0.9rem;
		letter-spacing: 0;
	}

	.quiz-content {
		display: grid;
		gap: 1.15rem;
	}

	.question-card,
	.choices button,
	.state-panel,
	.result-panel {
		border: 1px solid var(--color-border);
		border-radius: 1.5rem;
		background: var(--color-surface);
		box-shadow: var(--shadow-sm);
	}

	.question-card {
		display: grid;
		min-height: 15rem;
		place-items: center;
		padding: clamp(2rem, 8vw, 4rem);
		text-align: center;
	}

	.question-label,
	.caption {
		margin: 0;
		color: var(--color-text-secondary);
		font-size: 0.78rem;
		font-weight: 900;
		letter-spacing: 0.08em;
	}

	h1 {
		margin: 0.5rem 0;
		color: var(--color-text);
		font-size: clamp(3rem, 10vw, 5.5rem);
		line-height: 1;
	}

	.hint,
	.feedback {
		margin: 0;
		color: var(--color-text-secondary);
		font-size: 1rem;
	}

	.preview-notice {
		margin: 0;
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
		padding: 0.75rem 1rem;
		background: color-mix(in srgb, var(--color-warning) 12%, var(--color-surface));
		color: var(--color-text-secondary);
		font-size: 0.85rem;
		font-weight: 700;
		text-align: center;
	}

	.feedback {
		font-weight: 800;
	}

	.feedback.correct {
		color: var(--color-success);
	}

	.feedback.incorrect {
		color: var(--color-error);
	}

	.choices {
		display: grid;
		gap: 0.85rem;
	}

	.choices button {
		padding: 1.2rem 1.5rem;
		color: var(--color-text);
		font: inherit;
		font-weight: 800;
		text-align: left;
		cursor: pointer;
		transition:
			border-color var(--duration-fast) ease,
			background var(--duration-fast) ease,
			transform var(--duration-fast) ease;
	}

	.choices button:hover:not(:disabled) {
		border-color: var(--color-primary);
		background: color-mix(in srgb, var(--color-primary) 8%, var(--color-surface));
		transform: translateY(-2px);
	}

	.choices button.selected {
		border-color: var(--color-primary);
	}

	.choices button.correct-choice {
		border-color: var(--color-success);
		background: color-mix(in srgb, var(--color-success) 16%, var(--color-surface));
		color: var(--color-success);
	}

	.choices button.wrong-choice {
		border-color: var(--color-error);
		background: color-mix(in srgb, var(--color-error) 12%, var(--color-surface));
	}

	.next-button,
	.result-actions button,
	.secondary-button {
		display: inline-flex;
		min-height: 3.5rem;
		align-items: center;
		justify-content: center;
		border-radius: 1.1rem;
		padding: 0.9rem 1.25rem;
		font: inherit;
		font-weight: 900;
		text-decoration: none;
	}

	.next-button,
	.result-actions button {
		border: 1px solid var(--color-primary-active);
		background: var(--color-primary-active);
		color: var(--color-surface);
		cursor: pointer;
	}

	.next-button:disabled {
		cursor: not-allowed;
		opacity: 0.45;
	}

	.next-button:not(:disabled):hover,
	.result-actions button:hover {
		background: var(--color-primary-hover);
	}

	.state-panel,
	.result-panel {
		padding: 3rem 1.5rem;
		text-align: center;
	}

	.error-panel {
		color: var(--color-error);
	}

	.secondary-button {
		border: 1px solid var(--color-border);
		background: var(--color-surface);
		color: var(--color-text);
	}

	.score {
		margin: 1rem 0;
		color: var(--color-primary);
		font-size: 3.5rem;
		font-weight: 900;
	}

	.score span {
		color: var(--color-text-secondary);
		font-size: 1.1rem;
	}

	.result-actions {
		display: flex;
		justify-content: center;
		gap: 0.75rem;
		margin-top: 1.5rem;
	}

	@media (max-width: 520px) {
		.quiz-header {
			align-items: flex-start;
			flex-direction: column;
		}

		.quiz-meta {
			text-align: left;
		}

		.result-actions {
			flex-direction: column;
		}
	}
</style>
