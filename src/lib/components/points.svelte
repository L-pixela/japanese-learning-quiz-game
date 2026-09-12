<script lang="ts">
	type Size = 'sm' | 'md' | 'lg'

	type Props = {
		points: number
		size?: Size
		label?: string
	}

	let { points, size = 'md', label = 'Points' }: Props = $props()

	let formatted = $derived(new Intl.NumberFormat('en-US').format(points))
</script>

<div class="points points--{size}">
	<span class="points-value">{formatted}</span>
	<span class="points-label">{label}</span>
</div>

<style>
	.points {
		display: inline-flex;
		flex-direction: column;
		align-items: center;
		gap: var(--spacing-xs);
	}

	.points-value {
		font-weight: var(--font-weight-bold);
		color: var(--color-text);
	}

	.points-label {
		font-size: var(--font-size-caption);
		color: var(--color-text-secondary);
	}

	.points--sm .points-value {
		font-size: var(--font-size-body);
	}

	.points--md .points-value {
		font-size: var(--font-size-h3);
	}

	.points--lg .points-value {
		font-size: var(--font-size-h2);
	}
</style>
