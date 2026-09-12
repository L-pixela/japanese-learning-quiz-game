<script lang="ts">
	type Props = {
		streak: number
		label?: string
		description?: string
		unit?: string
		compact?: boolean
	}

	let {
		streak,
		label = 'STREAK UPDATED / 連続日数更新',
		description = 'Keep practicing every day. / 毎日練習を続けましょう。',
		unit = 'DAYS / 日',
		compact = false,
	}: Props = $props()
</script>

<section
	class="streak-banner"
	class:streak-banner--compact={compact}
	aria-label="Streak update / 連続日数更新"
>
	<div class="streak-spark" aria-hidden="true"><span></span><span></span><span></span></div>
	<div class="streak-copy">
		<span class="metric-label">{label}</span>
		<h2>{streak} day streak / 連続 {streak}日</h2>
		<p>{description}</p>
	</div>
	<div class="streak-change" aria-label="Current streak / 現在の連続日数">
		<span>{streak}</span>
		<small>{unit}</small>
	</div>
</section>

<style>
	.streak-banner {
		position: relative;
		display: flex;
		align-items: center;
		gap: var(--spacing-md);
		margin-top: var(--spacing-md);
		padding: var(--spacing-lg);
		overflow: hidden;
		border: 1px solid var(--color-accent-strong);
		border-radius: var(--radius-lg);
		background: var(--color-accent-strong);
		color: var(--color-surface);
		animation: banner-in 500ms var(--ease-out) both;
	}

	.streak-banner--compact {
		padding: var(--spacing-md) var(--spacing-lg);
	}

	.streak-banner--compact::after {
		top: -3.5rem;
		font-size: 10rem;
	}

	.streak-banner::after {
		content: '7';
		position: absolute;
		right: 4.5rem;
		top: -2.8rem;
		color: color-mix(in srgb, var(--color-surface) 10%, transparent);
		font-size: 12rem;
		font-weight: var(--font-weight-bold);
		line-height: 1;
	}

	.streak-copy {
		position: relative;
		z-index: 1;
	}

	.metric-label {
		color: var(--color-surface);
		font-size: var(--font-size-caption);
		font-weight: var(--font-weight-bold);
		letter-spacing: 0.1em;
	}

	h2 {
		margin: var(--spacing-xs) 0;
		font-size: var(--font-size-h3);
	}

	.streak-banner--compact h2 {
		font-size: var(--font-size-body);
	}

	p {
		margin: 0;
		color: color-mix(in srgb, var(--color-surface) 82%, transparent);
		font-size: var(--font-size-small);
	}

	.streak-change {
		position: relative;
		z-index: 1;
		margin-left: auto;
		text-align: center;
	}

	.streak-change span {
		display: block;
		font-size: var(--font-size-h2);
		font-weight: var(--font-weight-bold);
		line-height: 1;
	}

	.streak-change small {
		color: color-mix(in srgb, var(--color-surface) 82%, transparent);
		font-size: var(--font-size-caption);
		font-weight: var(--font-weight-bold);
		letter-spacing: 0.1em;
	}

	.streak-spark {
		position: relative;
		z-index: 1;
		display: flex;
		align-items: flex-end;
		gap: var(--spacing-xs);
		width: 2.5rem;
		height: 3.2rem;
	}

	.streak-spark span {
		display: block;
		width: 0.55rem;
		border-radius: var(--radius-full) var(--radius-full) 0 0;
		background: color-mix(in srgb, var(--color-surface) 82%, transparent);
		animation: spark-rise 800ms var(--ease-out) both;
	}

	.streak-spark span:nth-child(1) {
		height: 1.35rem;
		animation-delay: 350ms;
	}
	.streak-spark span:nth-child(2) {
		height: 2.5rem;
		animation-delay: 450ms;
	}
	.streak-spark span:nth-child(3) {
		height: 1.9rem;
		animation-delay: 550ms;
	}

	@keyframes banner-in {
		from {
			opacity: 0;
			transform: translateY(0.75rem);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	@keyframes spark-rise {
		from {
			opacity: 0;
			transform: scaleY(0);
			transform-origin: bottom;
		}
		to {
			opacity: 1;
			transform: scaleY(1);
			transform-origin: bottom;
		}
	}

	@media (max-width: 760px) {
		.streak-banner {
			align-items: flex-start;
		}
		.streak-spark {
			margin-top: 0.1rem;
		}
	}

	@media (max-width: 480px) {
		.streak-banner {
			padding: var(--spacing-md);
		}
	}
</style>
