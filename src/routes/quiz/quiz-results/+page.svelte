<script lang="ts">
	import { resolve } from '$app/paths'
	import StudyShell from '$lib/components/StudyShell.svelte'
	import JapanScene from '$lib/components/JapanScene.svelte'
	import { QUESTION_TYPES } from '$lib/quiz-types'
	import { t, levelName, difficultyLabel } from '$lib/i18n.svelte'
	import type { PageData } from './$types'
	let { data }: { data: PageData } = $props()
	let result = $derived(data.result)

	// Attempts recorded before answers were stored have no breakdown to show.
	let review = $derived((result?.review ?? []).map((item, index) => ({ ...item, index })))
	let missed = $derived(review.filter((item) => !item.correct))
	// Which direction is weak matters more than the total: 6/10 made entirely of
	// reading mistakes is a different problem from 6/10 spread evenly.
	let byType = $derived(
		QUESTION_TYPES.map((type) => {
			const items = review.filter((item) => item.type === type)
				return { type, total: items.length, right: items.filter((i) => i.correct).length }
			}).filter((row) => row.total > 0),
		)
	let mistakesOnly = $state(false)
	let shown = $derived(mistakesOnly ? missed : review)
</script>

<svelte:head><title>{t('results.title')} · TanTore</title></svelte:head>
<StudyShell>
	{#if result}
		<section class={'verdict ' + (result.passed ? 'passed' : 'retry')}>
			<div class="verdict-art">
				<JapanScene scene={result.passed ? 'torii' : 'daruma'} />
			</div>
			<div class="verdict-copy">
				<p class="study-eyebrow">{t('results.eyebrow')}</p>
				<h1>{result.passed ? t('results.passedTitle') : t('results.failedTitle')}</h1>
				<p>{result.passed ? t('results.passedLead') : t('results.failedLead')}</p>
				<span class="verdict-stamp" lang="ja">{result.passed ? '合格' : '復習'}</span>
			</div>
		</section>
		<div class="results-layout">
			<section class="score-panel study-panel">
				<p class="study-eyebrow">
					{t('deck.level')}
					{String(result.level).padStart(2, '0')} · {difficultyLabel(result.difficulty)}
				</p>
				<h2>{levelName(result.level)}</h2>
				<div
					class="score-circle"
					class:passed={result.passed}
					style={'--score: ' + result.score * 10 + '%'}
				>
					<div>
						<strong>{result.score}<span>/10</span></strong><small
							>{t('results.correctAnswers')}</small
						>
					</div>
				</div>
				<span class={'study-pill ' + (result.passed ? 'completed' : 'attempted')}
					>{result.passed ? '✓ ' + t('results.passed') : t('results.notPassed')}</span
				>
				<p class="study-muted">{t('results.passMark')}</p>
			</section>
			<div class="result-details">
				<section class="study-panel earned">
					<div>
						<p class="study-eyebrow">{t('results.pointsEarned')}</p>
						<strong>+{result.pointsEarned}<span>pt</span></strong>
					</div>
					<p class="study-muted">
						{t('results.totalPoints', { n: result.user.points.toLocaleString() })}<br />{t(
							'results.streakDays',
							{ n: result.user.streak },
						)}
					</p>
				</section>
				<section class="study-panel community">
					<p class="study-eyebrow">{t('results.milestone')}</p>
					<strong>{result.completion.percentage}<span>%</span></strong>
					<h2>{t('results.completedThisLevel')}</h2>
					<p class="study-muted">
						{t('results.completionDetail', {
							done: result.completion.completedUsers,
							total: result.completion.totalUsers,
							level: result.level,
						})}
					</p>
					<div class="community-bar" aria-hidden="true">
						<span style={'width: ' + result.completion.percentage + '%'}></span>
					</div>
					<small>{t('results.countedOnce')}</small>
				</section>
			</div>
		</div>
		{#if review.length}
			<section class="review study-panel">
				<div class="review-head">
					<div>
						<p class="study-eyebrow">{t('results.questionLog')}</p>
						<h2>
							{missed.length === 0
								? t('results.cleanSheet')
								: missed.length === 1
									? t('results.oneToReview')
									: t('results.manyToReview', { n: missed.length })}
						</h2>
					</div>
					<ul class="type-scores" aria-label={t('a11y.scoreByType')}>
						{#each byType as row (row.type)}
							<li class:weak={row.right < row.total}>
								<small>{t(`ask.${row.type}`)}</small>
								<strong>{row.right}<span>/{row.total}</span></strong>
							</li>
						{/each}
					</ul>
				</div>
				<div class="review-controls">
					<div class="review-filter" role="group" aria-label={t('a11y.filterQuestions')}>
						<button type="button" class:on={!mistakesOnly} onclick={() => (mistakesOnly = false)}>
							{t('results.filterAll', { n: review.length })}
						</button>
						<button
							type="button"
							class:on={mistakesOnly}
							disabled={missed.length === 0}
							onclick={() => (mistakesOnly = true)}
						>
							{t('results.filterMistakes', { n: missed.length })}
						</button>
					</div>
				</div>
				<ol class="review-list">
					{#each shown as item (item.index)}
						{@const chose =
							item.chosenIndex === null ? t('results.noAnswer') : item.options[item.chosenIndex]}
						<li class={item.correct ? 'ok' : 'bad'}>
							<span class="q-num">{String(item.index + 1).padStart(2, '0')}</span>
							<div class="q-body">
								<p class="q-word">
									<span class="w-jp" lang="ja">{item.japanese}</span>
									{#if item.reading !== item.japanese}
										<span class="w-kana" lang="ja">{item.reading}</span>
									{/if}
									{#if item.meaning}<span class="w-en">{item.meaning}</span>{/if}
									<span class="q-asked">{t(`ask.${item.type}`)}</span>
								</p>
								<dl class="q-answers">
									<dt>{t('results.correctAnswer')}</dt>
									<dd class="correct">{item.options[item.correctIndex]}</dd>
									{#if !item.correct}
										<dt>{t('results.youChose')}</dt>
										<dd class="wrong">{chose}</dd>
									{/if}
								</dl>
							</div>
							<span class="q-mark">{item.correct ? '✓' : '×'}</span>
						</li>
					{/each}
				</ol>
			</section>
		{/if}
		<div class="study-actions">
			{#if result.passed && result.level < 10}<a
					class="study-button"
					href={resolve('/quiz/[level]', { level: String(result.level + 1) })}
					>{t('results.nextLevel')} →</a
				>{:else}<a
					class="study-button"
					href={resolve('/quiz/[level]', { level: String(result.level) })}
					>{t('results.practiceAgain')} ↗</a
				>{/if}<a class="study-button secondary" href={resolve('/quiz', {})}
				>{t('results.backToPath')}</a
			><a class="dashboard-link" href={resolve('/dashboard', {})}>{t('results.studyDesk')}</a>
		</div>
	{:else}<section class="study-panel">
			<p class="study-eyebrow">{t('results.emptyEyebrow')}</p>
			<h1>{t('results.emptyTitle')}</h1>
			<p class="study-muted">{t('results.emptyLead')}</p>
			<a class="study-button" href={resolve('/quiz', {})}>{t('results.chooseLevel')} →</a>
		</section>{/if}
</StudyShell>

<style>
	.verdict {
		display: grid;
		grid-template-columns: clamp(160px, 30vw, 260px) minmax(0, 1fr);
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
		background: var(--color-danger);
	}
	.verdict-art {
		aspect-ratio: 1;
		margin-left: 16px;
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
		line-height: var(--line-height-tight);
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
		--ring: var(--status-caution);
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
		/* Side padding keeps the label clear of the ring; the gap separates it
		   from the number instead of letting the two line boxes collide. */
		padding: 0 18px;
		gap: 10px;
		background: var(--color-surface);
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		flex-direction: column;
		text-align: center;
	}
	.score-circle strong {
		font-family: var(--font-display);
		font-size: clamp(44px, 8.5vw, 76px);
		font-weight: var(--font-weight-bold);
		/* A 76px number carries ~20px of leading it does not need here. */
		line-height: 1;
		/* Display tracking is set for letters; on digits it closes 1 and 0 into
		   each other. Numbers here read better with a little air, not less. */
		letter-spacing: 0.5px;
	}
	.score-circle strong span {
		margin-left: 6px;
		font-size: clamp(16px, 3vw, 26px);
		color: var(--color-text-faint);
		letter-spacing: 0;
	}
	.score-circle small {
		color: var(--color-text-secondary);
		font-size: var(--font-size-caption);
		font-weight: var(--font-weight-semibold);
		line-height: var(--line-height-snug);
		letter-spacing: 0.4px;
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
		font-size: clamp(32px, 6vw, 54px);
		font-weight: var(--font-weight-bold);
		letter-spacing: 0.5px;
	}
	.earned :global(.study-eyebrow),
	.community :global(.study-eyebrow) {
		margin-right: 14px;
	}
	.earned strong span,
	.community > strong span {
		margin-left: 5px;
		font-size: clamp(14px, 2.2vw, 20px);
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
			margin-left: 0;
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

	/* ---------- Question log ---------- */
	.review {
		margin-top: 30px;
	}
	.review-head {
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		gap: 16px;
		flex-wrap: wrap;
		margin-bottom: var(--spacing-lg);
	}
	.review-head h2 {
		margin: 0;
	}
	.review-filter {
		display: flex;
		gap: 6px;
		padding: 5px;
		border-radius: var(--radius-full);
		background: var(--color-surface-sunken);
	}
	.review-filter button {
		min-height: 44px;
		padding: 9px 18px;
		border: 0;
		border-radius: var(--radius-full);
		background: none;
		color: var(--color-text-secondary);
		font: inherit;
		font-size: var(--text-sm);
		font-weight: var(--font-weight-semibold);
		white-space: nowrap;
		cursor: pointer;
	}
	.review-filter button.on {
		background: var(--color-primary);
		color: var(--color-on-primary);
	}
	.review-filter button:disabled {
		opacity: 0.45;
		cursor: default;
	}
	.review-list {
		list-style: none;
		margin: 0;
		padding: 0;
		display: grid;
		gap: 10px;
	}
	.review-list li {
		display: grid;
		grid-template-columns: auto minmax(0, 1fr) auto;
		gap: 14px;
		align-items: center;
		padding: 16px 18px;
		border-radius: var(--radius-md);
		background: var(--color-surface-sunken);
		/* A color bar carries the verdict at a glance; the ✓/× carries it for
		   anyone who cannot see the color. */
		border-left: 5px solid var(--color-success);
	}
	.review-list li.bad {
		border-left-color: var(--color-danger);
	}
	.q-num {
		width: 22px;
		text-align: right;
		color: var(--color-text-faint);
		font-family: var(--font-display);
		font-size: var(--text-base);
		font-weight: var(--font-weight-bold);
	}
	.q-body {
		min-width: 0;
	}
	/* One headline per row: word, reading, gloss, then the direction tag pushed
	   to the far right. Baseline-aligned so three different type sizes still sit
	   on one line. */
	.q-word {
		display: flex;
		align-items: baseline;
		gap: 4px 12px;
		flex-wrap: wrap;
		margin: 0 0 12px;
	}
	.w-jp {
		font-family: var(--font-display);
		font-size: var(--text-lg);
		font-weight: var(--font-weight-bold);
	}
	.w-kana {
		color: var(--color-primary);
		font-size: var(--text-sm);
		font-weight: var(--font-weight-semibold);
	}
	.w-en {
		min-width: 0;
		color: var(--color-text-secondary);
		font-size: var(--text-sm);
		overflow-wrap: anywhere;
	}
	.q-asked {
		margin-left: auto;
		padding: 3px 10px;
		border-radius: var(--radius-full);
		background: var(--color-surface);
		color: var(--color-text-secondary);
		font-size: var(--text-xs);
		font-weight: var(--font-weight-bold);
		letter-spacing: 0.4px;
		text-transform: uppercase;
		white-space: nowrap;
	}
	/* One shared label column, so every answer in the list starts at the same x.
	   Sized to hold the longest label ("Correct answer") at this size. */
	.q-answers {
		--label-column: 132px;
		display: grid;
		grid-template-columns: var(--label-column) minmax(0, 1fr);
		gap: 6px 16px;
		align-items: baseline;
		margin: 0;
	}
	.q-answers dt {
		color: var(--color-text-faint);
		font-size: var(--text-xs);
		font-weight: var(--font-weight-medium);
		letter-spacing: 0.4px;
		text-transform: uppercase;
		white-space: nowrap;
	}
	.q-answers dd {
		margin: 0;
		font-size: var(--text-base);
		font-weight: var(--font-weight-semibold);
		overflow-wrap: anywhere;
	}
	.q-answers dd.correct {
		color: var(--color-success);
	}
	.q-answers dd.wrong {
		color: var(--color-danger);
		text-decoration: line-through;
		text-decoration-thickness: 1px;
	}
	.q-mark {
		display: grid;
		place-items: center;
		width: 32px;
		height: 32px;
		border-radius: var(--radius-full);
		background: var(--color-success);
		color: var(--color-on-primary);
		font-size: var(--text-base);
		font-weight: var(--font-weight-bold);
	}
	.bad .q-mark {
		background: var(--color-danger);
	}
	@media (max-width: 540px) {
		.review-list li {
			padding: 14px;
			gap: 10px;
		}
		/* Too narrow for two columns: the label sits above its value instead. */
		.q-answers {
			grid-template-columns: minmax(0, 1fr);
			gap: 2px;
		}
		.q-answers dd {
			margin-bottom: 6px;
		}
		.q-answers dd:last-child {
			margin-bottom: 0;
		}
	}

	.review-controls {
		display: flex;
		justify-content: flex-end;
		flex-wrap: wrap;
		gap: 12px;
		margin-bottom: var(--spacing-md);
	}
	.type-scores {
		display: flex;
		gap: 10px;
		flex-wrap: wrap;
		list-style: none;
		margin: 14px 0 0;
		padding: 0;
	}
	.type-scores li {
		padding: 8px 14px;
		border-radius: var(--radius-md);
		background: var(--color-success-soft);
	}
	.type-scores li.weak {
		background: var(--color-danger-soft);
	}
	.type-scores small {
		display: block;
		color: var(--color-text-secondary);
		font-size: var(--text-xs);
		font-weight: var(--font-weight-semibold);
	}
	.type-scores strong {
		font-family: var(--font-display);
		font-size: var(--text-lg);
		letter-spacing: 0.5px;
	}
	.type-scores strong span {
		margin-left: 3px;
		color: var(--color-text-faint);
		font-size: var(--text-sm);
	}
</style>
