<script lang="ts">
	import { tick, untrack } from 'svelte'
	import { SvelteSet } from 'svelte/reactivity'
	import { goto } from '$app/navigation'
	import { resolve } from '$app/paths'
	import StudyShell from '$lib/components/StudyShell.svelte'
	import { t, levelName, difficultyLabel } from '$lib/i18n.svelte'
	import { sfx } from '$lib/audio.svelte'
	import type { Question } from '$lib/quiz-types'
	import type { PageData } from './$types'
	let { data }: { data: PageData } = $props()
	type Quiz = {
		attemptId: string
		questions: Question[]
	}
	type QuizResult = {
		attemptId: string
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

	// The quiz no longer opens by itself. A level begins on its word list, and
	// the learner chooses when to be tested — the two halves of the same page.
	let started = $state(false)
	let search = $state('')
	/** Covers the English so the list doubles as a self-test; tap to reveal. */
	let hideMeanings = $state(false)
	const revealed = new SvelteSet<string>()

	function toggleReveal(id: string) {
		if (revealed.has(id)) revealed.delete(id)
		else revealed.add(id)
		sfx('tick')
	}
	let words = $derived(
		data.words.filter((word) => {
			const term = search.trim().toLowerCase()
			return (
				!term ||
				word.japanese.includes(term) ||
				word.reading.includes(term) ||
				word.meaning.toLowerCase().includes(term)
			)
		}),
	)

	async function beginQuiz() {
		started = true
		sfx('select')
		await start()
	}

	function backToStudy() {
		result = null
		started = false
		quiz = null
		error = ''
	}
	async function continueStudy() {
		backToStudy()
		await tick()
		document.getElementById('words')?.focus()
	}
	function openResults(dialog: HTMLDialogElement) {
		const previousOverflow = document.body.style.overflow
		dialog.showModal()
		document.body.style.overflow = 'hidden'
		return {
			destroy() {
				dialog.close()
				document.body.style.overflow = previousOverflow
			},
		}
	}
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
			if (!response.ok) throw new Error(started.error ?? t('quiz.startFailed'))
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
			if (!response.ok) throw new Error(graded.error ?? t('quiz.saveFailed'))
			// Submit already returns the graded result, so the summary opens without a round trip.
			result = graded
			sfx(graded.passed ? 'pass' : 'fail')
		} catch (e) {
			error =
				e instanceof Error
					? e.message
					: 'Unable to connect. Your answers are still here; try again.'
		} finally {
			busy = false
		}
	}

	// "Next quiz" only changes the route param, so the component is reused.
	// Watch the level and deal a fresh set of words whenever it moves.
	let loadedLevel = untrack(() => data.level.level)
	$effect(() => {
		const level = data.level.level
		if (level === loadedLevel) return
		loadedLevel = level
		result = null
		quiz = null
		// A new level always opens on its words, never mid-quiz.
		started = false
		search = ''
		revealed.clear()
	})

	// During the quiz the card is sized to the viewport, so lock the page:
	// no scroll, no footer, and the shared chrome flexes to give the card room.
	$effect(() => {
		document.body.classList.toggle('quiz-active', started)
		return () => document.body.classList.remove('quiz-active')
	})
	async function nextQuiz() {
		await goto(resolve('/quiz/[level]', { level: String(data.level.level + 1) }))
	}
	function retry() {
		result = null
		started = true
		void start()
	}
</script>

<svelte:head><title>Level {data.level.level} · TanTore</title></svelte:head>
<StudyShell confirmNavigation={started && result === null}>
	<div class="quiz-top">
		<a class="quiz-top-back" href={resolve('/quiz', {})}>← {t('level.allLevels')}</a>
		{#if started}
			<div class="quiz-top-title">
				<span class="quiz-top-level"
					>{t('deck.level')}
					{String(data.level.level).padStart(2, '0')} ·
					{difficultyLabel(data.level.difficulty)}</span
				>
				<span class="quiz-top-name" lang="ja"
					>{levelName(data.level.level)} / {data.level.japanese}</span
				>
			</div>
		{/if}
	</div>

	{#if !started}
		<!-- Step 1. The words, and the decision to be tested on them. -->
		<section class="level-intro" id="words" tabindex="-1">
			<div class="intro-copy">
				<p class="study-eyebrow">{t('level.stepStudy')}</p>
				<h1>{levelName(data.level.level)} <span lang="ja">{data.level.japanese}</span></h1>
				<p class="study-muted">{t('level.studyLead', { count: data.count })}</p>
			</div>
			<div class="intro-facts">
				<div><strong>{data.count}</strong><small>{t('deck.wordsInDeck')}</small></div>
				<div><strong>10</strong><small>{t('deck.drawnPerQuiz')}</small></div>
				<div>
					<strong>{data.progress?.attempts ? data.progress.bestScore + '/10' : '—'}</strong><small
						>{t('level.yourBest')}</small
					>
				</div>
			</div>
		</section>

		<div class="level-start">
			<div>
				<p class="study-eyebrow">{t('level.stepQuiz')}</p>
				<p class="study-muted">{t('quiz.rules')}</p>
			</div>
			<button class="study-button" onclick={beginQuiz} disabled={busy}>
				{t('level.startQuiz')} <span aria-hidden="true">↗</span>
			</button>
		</div>

		<div class="deck-actions">
			<input
				type="search"
				placeholder={t('deck.search')}
				aria-label={t('deck.searchLabel')}
				bind:value={search}
			/>
			<button
				type="button"
				class="study-button secondary cover-toggle"
				aria-pressed={hideMeanings}
				onclick={() => {
					hideMeanings = !hideMeanings
					revealed.clear()
					sfx('tick')
				}}
			>
				{hideMeanings ? t('deck.showMeanings') : t('deck.hideMeanings')}
			</button>
		</div>

		{#if data.count === 0}
			<p class="deck-empty">{t('deck.empty')}</p>
		{:else if words.length === 0}
			<p class="deck-empty">{t('deck.noMatch', { term: search })}</p>
		{:else}
			<ol class="word-list" aria-label={t('a11y.vocabularyFor', { level: data.level.level })}>
				{#each words as word, index (word.id)}<li>
						<span class="word-index">{String(index + 1).padStart(2, '0')}</span>
						<span class="word-japanese" lang="ja">{word.japanese}</span>
						<span class="word-reading" lang="ja">{word.reading}</span>
						{#if hideMeanings && !revealed.has(word.id)}
							<button type="button" class="word-cover" onclick={() => toggleReveal(word.id)}>
								{t('deck.tapToReveal')}
							</button>
						{:else}
							<span class="word-meaning">{word.meaning}</span>
						{/if}
					</li>{/each}
			</ol>
			<p class="study-muted deck-note">
				{t('deck.showing', { shown: words.length, total: data.count })}
			</p>
		{/if}

		<nav class="level-tabs" aria-label={t('deck.chooseLevel')}>
			{#each data.levels as entry (entry.level)}<a
					href={resolve('/quiz/[level]', { level: String(entry.level) })}
					class:current={entry.level === data.level.level}
					class:done={entry.status === 'completed'}
					aria-current={entry.level === data.level.level ? 'page' : undefined}
					><small>{String(entry.level).padStart(2, '0')}</small><span lang="ja"
						>{entry.japanese}</span
					></a
				>{/each}
		</nav>
	{:else}
		<section class="quiz-sheet">
			{#if quiz && question}
				<div class="question-meta">
					<span>{t('quiz.question')} {String(current + 1).padStart(2, '0')} / 10</span>
				</div>
				<progress value={current + 1} max="10" aria-label={t('a11y.questionProgress')}></progress>
				<div class="word-prompt" aria-live="polite">
					<span class="ask-type">{t(`ask.${question.type}`)}</span>
					{#if question.type === 'word'}
						<h1 class="prompt-en">{question.meaning}</h1>
					{:else}
						{#if question.reading && question.reading !== question.japanese}
							<p lang="ja">{question.reading}</p>
						{/if}
						<h1 lang="ja">{question.japanese}</h1>
					{/if}
					<span>{t(`ask.${question.type}Hint`)}</span>
				</div>
				<fieldset disabled={busy}>
					<legend class="sr-only"
						>{t('a11y.answerFor', { word: question.japanese ?? question.meaning ?? '' })}</legend
					>
					<div class="options">
						{#each question.options as option, index (current + ':' + index)}<label
								class:selected={answers[current] === index}
								><input
									type="radio"
									name={'question-' + current}
									value={index}
									bind:group={answers[current]}
									onchange={() => sfx('select')}
								/><span class="option-letter">{String.fromCharCode(65 + index)}</span><span
									lang={question.type === 'meaning' ? 'en' : 'ja'}>{option}</span
								></label
							>{/each}
					</div>
				</fieldset>
				<div class="quiz-controls">
					<button
						class="study-button secondary"
						disabled={current === 0 || busy}
						onclick={() => {
							current--
							sfx('tick')
						}}>← {t('quiz.back')}</button
					>
					<div class="quiz-controls-end">
						<button class="study-button secondary" onclick={backToStudy} disabled={busy}
							>← {t('level.backToStudy')}</button
						>{#if current < 9}<button
								class="study-button"
								disabled={answers[current] < 0 || busy}
								onclick={() => {
									current++
									sfx('tick')
								}}>{t('quiz.next')} →</button
							>{:else}<button
								class="study-button"
								disabled={busy || answers.some((answer) => answer < 0)}
								onclick={submit}>{busy ? t('quiz.saving') : t('quiz.finish') + ' ↗'}</button
							>{/if}
					</div>
				</div>
			{:else}<div class="loading">
					<h1>{busy ? t('quiz.opening') : t('quiz.ready')}</h1>
					<p class="study-muted">{t('quiz.readyLead')}</p>
					{#if !busy}<button class="study-button" onclick={start}>{t('quiz.tryAgain')}</button>{/if}
				</div>{/if}
			{#if error}<p class="study-error" role="alert">{error}</p>{/if}
		</section>
	{/if}

	{#if result}
		<dialog
			class="result-backdrop"
			use:openResults
			aria-labelledby="result-title"
			aria-describedby="result-lead"
			oncancel={(event) => {
				event.preventDefault()
				void continueStudy()
			}}
		>
			<div class={'result-card ' + (result.passed ? 'passed' : 'failed')}>
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
				<p class="result-lead" id="result-lead">
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
						href={resolve('/quiz/quiz-results', {}) + '?attempt=' + result.attemptId}
						>{t('result.reviewAnswers')}</a
					>
					<button class="study-button secondary" onclick={continueStudy}
						>{t('result.continueStudy')}</button
					>
				</div>
			</div>
		</dialog>
	{/if}
</StudyShell>

<style>
	.quiz-top {
		display: grid;
		grid-template-columns: 1fr auto 1fr;
		align-items: center;
		gap: var(--spacing-md);
		font-size: var(--font-size-caption);
		margin-bottom: var(--spacing-lg);
		color: var(--color-text-secondary);
	}
	.quiz-top-back {
		justify-self: start;
		padding: var(--spacing-sm);
		text-decoration: none;
	}
	.quiz-top-title {
		justify-self: center;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: var(--spacing-sm);
		text-align: center;
		line-height: var(--line-height-snug);
		min-width: 0;
	}
	.quiz-top-name {
		font-family: var(--font-display);
		font-size: var(--font-size-body);
		font-weight: var(--font-weight-bold);
		color: var(--color-text);
		overflow-wrap: anywhere;
	}
	.quiz-top a {
		text-decoration: none;
	}
	.quiz-sheet {
		width: min(820px, 100%);
		margin: auto;
		padding: var(--spacing-lg);
		border-radius: var(--radius-xl);
		background: var(--color-surface);
		box-shadow: var(--shadow-md);
		display: flex;
		flex-direction: column;
		min-height: 0;
	}
	/* Quiz phase: the card owns whatever height the viewport leaves over the
	   nav and the escape button, so the page never scrolls. */
	:global(body.quiz-active) {
		overflow: hidden;
	}
	:global(body.quiz-active .study-app) {
		display: flex;
		flex-direction: column;
		box-sizing: border-box;
		height: calc(100vh / var(--app-zoom));
		height: calc(100dvh / var(--app-zoom));
	}
	:global(body.quiz-active .study-footer) {
		display: none;
	}
	:global(body.quiz-active .study-main) {
		flex: 1 1 auto;
		min-height: 0;
		display: flex;
		flex-direction: column;
		overflow: hidden;
	}
	/* Keep the card's padding identical to the words page so the breadcrumb and
	   level sit in the same place; only tighten when the viewport is too short to
	   fit the quiz without scrolling. */
	:global(body.quiz-active .quiz-sheet) {
		flex: 1 1 auto;
		min-height: 0;
		padding: var(--spacing-lg);
	}
	.question-meta {
		display: flex;
		justify-content: space-between;
		gap: var(--spacing-md);
		font-size: var(--font-size-caption);
		color: var(--color-text-secondary);
		margin: var(--spacing-md);
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
		flex: 1 1 auto;
		min-height: 0;
		display: grid;
		justify-items: center;
		align-content: center;
		--prompt-reading: clamp(1.2em, 4vh, 1.7em);
		--prompt-word: clamp(44px, 11vh, 84px);
		/* No uniform row gap — the furigana hugs the kanji, while the tag and hint
		   carry their own spacing (see below). */
		row-gap: 0;
		column-gap: var(--spacing-md);
		/* Reserved tracks: each band keeps its space even when a question has no
		   furigana or a shorter word, so the prompt never shifts the options. The
		   minmax(0, …) lets a band compress under pressure instead of spilling its
		   kanji up over the answer buttons when the viewport is short. */
		grid-template-rows: auto minmax(0, var(--prompt-reading)) minmax(0, var(--prompt-word)) auto;
		padding: var(--spacing-md);
	}
	.word-prompt .ask-type {
		grid-row: 1;
		margin-bottom: var(--spacing-lg);
	}
	.word-prompt p {
		grid-row: 2;
		align-self: end;
		margin: 0;
		padding-bottom: var(--spacing-sm);
		font-size: var(--font-size-body);
		letter-spacing: 3px;
		color: var(--color-text-secondary);
	}
	.word-prompt h1 {
		grid-row: 3;
		display: grid;
		place-content: center;
		margin: 0;
		font-family: var(--font-display);
		font-size: clamp(34px, 8vh, 64px);
		letter-spacing: 4px;
		overflow-wrap: anywhere;
	}
	.word-prompt > span {
		grid-row: 4;
		margin-top: var(--spacing-lg);
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
		gap: var(--spacing-md);
	}
	.options label {
		position: relative;
		display: flex;
		gap: var(--spacing-md);
		align-items: center;
		min-height: clamp(46px, 8.5vh, 72px);
		padding: var(--spacing-md);
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
		width: clamp(30px, 5vh, 36px);
		height: clamp(30px, 5vh, 36px);
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
		gap: var(--spacing-md);
		margin-top: var(--spacing-lg);
	}
	.quiz-controls-end {
		display: flex;
		align-items: center;
		gap: var(--spacing-md);
	}
	.quiz-note {
		text-align: center;
		color: var(--color-text-secondary);
		font-size: var(--font-size-caption);
		margin-top: var(--spacing-lg);
	}
	.result-backdrop {
		position: fixed;
		inset: 0;
		z-index: var(--z-modal);
		display: grid;
		place-items: safe center;
		width: 100%;
		height: calc(100dvh / var(--app-zoom));
		max-width: none;
		max-height: none;
		margin: 0;
		padding: var(--spacing-md);
		border: 0;
		overflow-y: auto;
		background: transparent;
		color: var(--color-text);
		animation: fade var(--duration-base) var(--ease-out);
	}
	.result-backdrop::backdrop {
		background: rgba(20, 25, 17, 0.66);
		backdrop-filter: blur(3px);
	}
	.result-card {
		--card-padding: var(--spacing-lg);
		width: min(520px, 100%);
		padding: 0 var(--card-padding) var(--spacing-lg);
		border-radius: var(--radius-xl);
		background: var(--color-surface);
		box-shadow: var(--shadow-lg);
		text-align: center;
		animation: pop var(--duration-slow) var(--ease-out);
	}
	.result-art {
		position: relative;
		display: grid;
		place-items: center;
		margin: 0 calc(-1 * var(--card-padding)) var(--spacing-md);
		padding: var(--spacing-lg) 0 var(--spacing-md);
		border-radius: var(--radius-xl) var(--radius-xl) 0 0;
		background: linear-gradient(120deg, var(--color-primary) 0%, var(--color-secondary) 100%);
	}
	.failed .result-art {
		background: var(--color-danger);
	}
	.result-art img {
		width: clamp(88px, 18dvh, 128px);
		margin: 0;
		height: clamp(88px, 18dvh, 128px);
		border-radius: var(--radius-full);
		border: 5px solid #fff;
		object-fit: cover;
		object-position: center 25%;
	}
	.result-stamp {
		position: absolute;
		right: 14px;
		top: 12px;
		padding: var(--spacing-sm) var(--spacing-md);
		border-radius: var(--radius-full);
		background: var(--color-surface);
		color: var(--color-primary-active);
		box-shadow: var(--shadow-solid) rgba(20, 25, 17, 0.22);
		font-family: var(--font-display);
		font-size: 16px;
		font-weight: var(--font-weight-bold);
		letter-spacing: 3px;
	}
	.result-card h2 {
		margin: 0;
		font-size: clamp(20px, 3.3vw, 30px);
	}
	.result-lead {
		margin: var(--spacing-md) 0 0;
		color: var(--color-text-secondary);
		font-size: var(--font-size-small);
		line-height: var(--line-height-relaxed);
	}
	.result-stats {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: var(--spacing-md);
		margin: var(--spacing-md) 0;
		padding: var(--spacing-md) var(--spacing-sm);
		border-radius: var(--radius-lg);
		background: var(--color-surface-sunken);
	}
	.result-stats strong {
		overflow-wrap: anywhere;
		display: block;
		font-family: var(--font-display);
		font-size: clamp(21px, 3.6vw, 32px);
		font-weight: var(--font-weight-bold);
		letter-spacing: 0.5px;
	}
	.result-stats strong span {
		margin-left: var(--spacing-sm);
		font-size: var(--font-size-body);
		color: var(--color-text-faint);
	}
	.result-stats small {
		display: block;
		margin-top: var(--spacing-sm);
		color: var(--color-text-secondary);
		font-size: var(--font-size-caption);
		line-height: var(--line-height-snug);
	}
	.result-actions {
		display: grid;
		gap: var(--spacing-sm);
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
		padding: var(--spacing-lg) 0;
	}
	.study-error {
		margin-top: var(--spacing-lg);
	}
	@media (max-width: 550px) {
		.options {
			grid-template-columns: 1fr;
		}
		.quiz-controls {
			flex-wrap: wrap;
		}
		.quiz-controls .study-button {
			padding: var(--spacing-md) var(--spacing-md);
			font-size: var(--font-size-small);
		}
	}

	/* ---------- Step 1: the words ---------- */
	.level-intro {
		display: flex;
		flex-wrap: wrap;
		gap: var(--spacing-lg);
		justify-content: space-between;
		align-items: flex-end;
		padding: var(--spacing-lg);
		border-radius: var(--radius-lg);
		background: var(--color-surface);
		box-shadow: var(--shadow-sm);
	}
	.intro-copy {
		min-width: 0;
		flex: 1 1 320px;
	}
	.intro-copy h1 {
		margin-bottom: var(--spacing-md);
	}
	.intro-copy h1 span {
		margin-left: var(--spacing-md);
		color: var(--color-primary);
		font-size: var(--font-size-h3);
	}
	.intro-facts {
		display: flex;
		gap: var(--spacing-lg);
		flex-wrap: wrap;
	}
	.intro-facts div {
		display: grid;
		gap: var(--spacing-sm);
	}
	.intro-facts strong {
		font-family: var(--font-display);
		font-size: clamp(20px, 3.3vw, 30px);
		font-weight: var(--font-weight-bold);
	}
	.intro-facts small {
		color: var(--color-text-secondary);
		font-size: var(--font-size-caption);
	}
	/* ---------- Step 2: the decision ---------- */
	.level-start {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--spacing-lg);
		flex-wrap: wrap;
		margin-top: var(--spacing-lg);
		padding: var(--spacing-lg);
		border-radius: var(--radius-lg);
		background: var(--color-primary);
		color: var(--color-on-primary);
		box-shadow: var(--shadow-md);
	}
	.level-start > div {
		min-width: 0;
		flex: 1 1 260px;
	}
	.level-start :global(.study-eyebrow) {
		margin-bottom: var(--spacing-sm);
		background: rgba(251, 247, 236, 0.2);
		color: var(--color-on-primary);
	}
	.level-start .study-muted {
		margin: 0;
		color: var(--color-on-primary);
		font-size: var(--font-size-body);
		opacity: 0.85;
	}
	.level-start :global(.study-button) {
		flex-shrink: 0;
		background: var(--color-accent);
		color: var(--panel-dark-deep);
		box-shadow: var(--shadow-solid) rgba(0, 0, 0, 0.25);
	}
	/* ---------- The word list ---------- */
	.deck-actions {
		display: flex;
		gap: var(--spacing-md);
		align-items: center;
		margin: var(--spacing-lg) 0 var(--spacing-lg);
	}
	.deck-actions input {
		flex: 1;
		min-width: 0;
		min-height: 56px;
		padding: var(--spacing-md) var(--spacing-lg);
		border: 2px solid var(--color-border);
		border-radius: var(--radius-full);
		background: var(--color-surface);
		color: var(--color-text);
		font: inherit;
		font-size: var(--font-size-body);
	}
	.deck-actions input:focus {
		border-color: var(--color-primary);
		outline: none;
	}
	.word-list {
		list-style: none;
		padding: 0;
		margin: 0;
		border-radius: var(--radius-lg);
		background: var(--color-surface);
		box-shadow: var(--shadow-sm);
		overflow: hidden;
	}
	.word-list li {
		display: grid;
		grid-template-columns: 44px minmax(0, 1fr) minmax(0, 1fr) minmax(0, 1.4fr);
		gap: var(--spacing-md);
		align-items: baseline;
		padding: var(--spacing-md) var(--spacing-lg);
		border-bottom: 1px solid var(--color-border-subtle);
	}
	.word-list li:last-child {
		border-bottom: 0;
	}
	.word-list li:nth-child(even) {
		background: var(--color-surface-sunken);
	}
	.word-index {
		color: var(--color-text-faint);
		font-size: var(--font-size-caption);
		font-weight: var(--font-weight-semibold);
	}
	.word-japanese {
		font-family: var(--font-display);
		font-size: clamp(18px, 2.7vw, 24px);
		font-weight: var(--font-weight-bold);
	}
	.word-reading {
		color: var(--color-primary);
		font-size: var(--font-size-body);
	}
	.word-meaning {
		font-size: var(--font-size-body);
		overflow-wrap: anywhere;
	}
	.deck-empty {
		padding: var(--spacing-lg);
		border-radius: var(--radius-lg);
		border: 2px dashed var(--color-border-strong);
		color: var(--color-text-secondary);
		font-size: var(--font-size-body);
		text-align: center;
	}
	.deck-note {
		margin-top: var(--spacing-lg);
		font-size: var(--font-size-caption);
	}
	/* ---------- Level switcher ---------- */
	.level-tabs {
		display: grid;
		grid-template-columns: repeat(10, minmax(0, 1fr));
		gap: var(--spacing-sm);
		margin: var(--spacing-lg) 0 0;
	}
	.level-tabs a {
		display: grid;
		gap: var(--spacing-sm);
		justify-items: center;
		padding: var(--spacing-md) var(--spacing-sm);
		border-radius: var(--radius-md);
		background: var(--color-surface);
		box-shadow: var(--shadow-solid) var(--color-border);
		font-family: var(--font-display);
		font-size: var(--font-size-body);
		font-weight: var(--font-weight-bold);
		text-align: center;
		text-decoration: none;
		overflow-wrap: anywhere;
	}
	.level-tabs small {
		color: var(--color-text-faint);
		font-size: var(--font-size-caption);
		letter-spacing: 1px;
	}
	.level-tabs a.done {
		background: var(--color-success-soft);
		box-shadow: var(--shadow-solid) var(--color-border-strong);
	}
	.level-tabs a.current {
		background: var(--color-primary);
		color: var(--color-on-primary);
		box-shadow: var(--shadow-solid) var(--color-primary-shadow);
	}
	.level-tabs a.current small {
		color: var(--color-primary-soft);
	}
	@media (max-width: 800px) {
		.word-list li {
			grid-template-columns: 34px minmax(0, 1fr) minmax(0, 1fr);
			padding: var(--spacing-md) var(--spacing-md);
		}
		.word-meaning {
			grid-column: 2 / -1;
		}
		/* Ten tabs never fit a phone; five by two do. */
		.level-tabs {
			grid-template-columns: repeat(5, minmax(0, 1fr));
		}
	}
	@media (max-width: 480px) {
		.level-start :global(.study-button) {
			width: 100%;
		}
		.word-list li {
			grid-template-columns: 30px minmax(0, 1fr);
			gap: var(--spacing-sm) var(--spacing-md);
		}
		.word-reading,
		.word-meaning {
			grid-column: 2 / -1;
		}
	}
	.ask-type {
		display: inline-block;
		margin-bottom: var(--spacing-md);
		padding: var(--spacing-sm) var(--spacing-md);
		border-radius: var(--radius-full);
		background: var(--color-primary-soft);
		color: var(--color-primary-active);
		font-size: var(--text-xs);
		font-weight: var(--font-weight-bold);
		letter-spacing: 0.5px;
		text-transform: uppercase;
	}
	/* An English prompt needs the body face and a smaller size — the display
	   face is sized for two or three kanji, not a phrase. */
	.prompt-en {
		font-family: var(--font-body) !important;
		font-size: clamp(22px, 5vh, 38px) !important;
		line-height: var(--line-height-tight);
	}

	.cover-toggle {
		flex-shrink: 0;
		min-height: 56px;
	}
	.cover-toggle[aria-pressed='true'] {
		background: var(--color-primary);
		color: var(--color-on-primary) !important;
		box-shadow: var(--shadow-solid) var(--color-primary-shadow);
	}
	/* Sits in the meaning column so revealing a row never shifts the layout. */
	.word-cover {
		width: 100%;
		min-height: 40px;
		padding: var(--spacing-sm) var(--spacing-md);
		border: 1px dashed var(--color-border-strong);
		border-radius: var(--radius-md);
		background: var(--color-surface-sunken);
		color: var(--color-text-faint);
		font: inherit;
		font-size: var(--font-size-caption);
		text-align: left;
		cursor: pointer;
	}
	.word-cover:hover {
		border-style: solid;
		color: var(--color-primary);
	}
	/* The prompt bands and options above already scale with vh, so the card fits
	   normal phones and laptops. This floor only kicks in for very short
	   viewports (phone landscape) to guarantee no scroll and no overlap. */
	@media (max-height: 500px) {
		.word-prompt {
			--prompt-reading: 1em;
			--prompt-word: clamp(30px, 8vh, 44px);
			padding: var(--spacing-sm) 0;
		}
		.word-prompt h1 {
			font-size: clamp(26px, 6vh, 40px);
		}
		.options label {
			min-height: clamp(38px, 7vh, 52px);
		}
	}
</style>
