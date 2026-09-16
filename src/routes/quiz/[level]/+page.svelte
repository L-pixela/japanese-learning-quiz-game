<script lang="ts">
	import { untrack } from 'svelte'
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
		started = false
		quiz = null
		error = ''
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
<StudyShell>
	<div class="quiz-top">
		<a href={resolve('/quiz', {})}>← {t('level.allLevels')}</a><span
			>{t('deck.level')}
			{String(data.level.level).padStart(2, '0')} · {difficultyLabel(data.level.difficulty)}</span
		>
	</div>

	{#if !started}
		<!-- Step 1. The words, and the decision to be tested on them. -->
		<section class="level-intro" id="words">
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
			<p class="study-eyebrow">{levelName(data.level.level)} / {data.level.japanese}</p>
			{#if quiz && question}
				<div class="question-meta">
					<span>{t('quiz.question')} {String(current + 1).padStart(2, '0')} / 10</span><span
						>{t('quiz.chooseMeaning')}</span
					>
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
					><span
						>{t('quiz.answered', { done: answers.filter((answer) => answer >= 0).length })}</span
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
			{:else}<div class="loading">
					<h1>{busy ? t('quiz.opening') : t('quiz.ready')}</h1>
					<p class="study-muted">{t('quiz.readyLead')}</p>
					{#if !busy}<button class="study-button" onclick={start}>{t('quiz.tryAgain')}</button>{/if}
				</div>{/if}
			{#if error}<p class="study-error" role="alert">{error}</p>{/if}
		</section>
		<p class="quiz-note">{t('quiz.note')}</p>
		<div class="quiz-escape">
			<button class="study-button secondary" onclick={backToStudy} disabled={busy}
				>← {t('level.backToStudy')}</button
			>
		</div>
	{/if}

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
						href={resolve('/quiz/quiz-results', {}) + '?attempt=' + result.attemptId}
						>{t('result.reviewAnswers')}</a
					>
					<a
						class="study-button secondary"
						href={resolve('/quiz/[level]', { level: String(result.level) }) + '#words'}
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
		letter-spacing: 0.5px;
	}
	.result-stats strong span {
		margin-left: 4px;
		font-size: var(--font-size-body);
		color: var(--color-text-faint);
	}
	.result-stats small {
		display: block;
		margin-top: 4px;
		color: var(--color-text-secondary);
		font-size: var(--font-size-caption);
		line-height: var(--line-height-snug);
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

	/* ---------- Step 1: the words ---------- */
	.level-intro {
		display: flex;
		flex-wrap: wrap;
		gap: 25px;
		justify-content: space-between;
		align-items: flex-end;
		padding: clamp(22px, 3vw, 30px);
		border-radius: var(--radius-lg);
		background: var(--color-surface);
		box-shadow: var(--shadow-sm);
	}
	.intro-copy {
		min-width: 0;
		flex: 1 1 320px;
	}
	.intro-copy h1 {
		margin-bottom: 10px;
	}
	.intro-copy h1 span {
		margin-left: 10px;
		color: var(--color-primary);
		font-size: var(--font-size-h3);
	}
	.intro-facts {
		display: flex;
		gap: clamp(18px, 3vw, 30px);
		flex-wrap: wrap;
	}
	.intro-facts div {
		display: grid;
		gap: 3px;
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
		gap: 20px;
		flex-wrap: wrap;
		margin-top: 18px;
		padding: clamp(20px, 2.6vw, 26px) clamp(22px, 3vw, 30px);
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
		margin-bottom: 8px;
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
	.quiz-escape {
		display: flex;
		justify-content: center;
		margin-top: 20px;
	}
	/* ---------- The word list ---------- */
	.deck-actions {
		display: flex;
		gap: 14px;
		align-items: center;
		margin: 26px 0 18px;
	}
	.deck-actions input {
		flex: 1;
		min-width: 0;
		min-height: 56px;
		padding: 14px 22px;
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
		gap: 14px;
		align-items: baseline;
		padding: 16px 24px;
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
		padding: 44px;
		border-radius: var(--radius-lg);
		border: 2px dashed var(--color-border-strong);
		color: var(--color-text-secondary);
		font-size: var(--font-size-body);
		text-align: center;
	}
	.deck-note {
		margin-top: 18px;
		font-size: var(--font-size-caption);
	}
	/* ---------- Level switcher ---------- */
	.level-tabs {
		display: grid;
		grid-template-columns: repeat(10, minmax(0, 1fr));
		gap: 6px;
		margin: 32px 0 0;
	}
	.level-tabs a {
		display: grid;
		gap: 3px;
		justify-items: center;
		padding: 13px 4px;
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
			padding: 14px 16px;
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
			gap: 6px 10px;
		}
		.word-reading,
		.word-meaning {
			grid-column: 2 / -1;
		}
	}

	.ask-type {
		display: inline-block;
		margin-bottom: 16px;
		padding: 6px 14px;
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
		font-size: clamp(26px, 4.6vw, 40px) !important;
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
		padding: 8px 14px;
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
</style>
