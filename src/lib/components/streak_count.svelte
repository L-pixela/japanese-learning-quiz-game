<script lang="ts">
	type Size = 'sm' | 'md' | 'lg'

	type Props = {
		streak: number
		size?: Size
	}

	let { streak, size = 'md' }: Props = $props()

	let isActive = $derived(streak > 0)
</script>

<div class="streak streak--{size}" class:streak--active={isActive}>
	<span class="streak-icon" aria-hidden="true">🔥</span>
	<span class="streak-value">{streak}</span>
	<span class="streak-label">day streak</span>
</div>

<style>
	.streak {
		display: inline-flex;
		align-items: center;
		gap: var(--spacing-xs);
		color: var(--color-text-secondary);
	}

	.streak--active {
		color: var(--color-warning);
	}

	.streak-icon {
		font-size: var(--font-size-body);
		filter: grayscale(1);
		opacity: 0.5;
	}

	.streak--active .streak-icon {
		filter: none;
		opacity: 1;
	}

	.streak-value {
		font-weight: var(--font-weight-bold);
		color: var(--color-text);
	}

	.streak--sm .streak-value {
		font-size: var(--font-size-small);
	}

	.streak--md .streak-value {
		font-size: var(--font-size-h3);
	}

	.streak--lg .streak-value {
		font-size: var(--font-size-h2);
	}

	.streak-label {
		font-size: var(--font-size-caption);
	}
</style>
