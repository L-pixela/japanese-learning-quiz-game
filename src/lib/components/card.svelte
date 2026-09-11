<script lang="ts">
	import type { Snippet } from 'svelte'

	type Props = {
		title?: string
		interactive?: boolean
		children?: Snippet
	}

	let { title, interactive = false, children }: Props = $props()
</script>

<div class="card" class:card--interactive={interactive}>
	{#if title}
		<h3>{title}</h3>
	{/if}

	{@render children?.()}
</div>

<style>
	.card {
		padding: var(--spacing-lg);
		background-color: var(--color-surface);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-lg);
		box-shadow: var(--shadow-sm);
		color: var(--color-text);
	}

	.card--interactive {
		cursor: pointer;
		transition:
			box-shadow var(--duration-fast) var(--ease-out),
			transform var(--duration-fast) var(--ease-out);
	}

	.card--interactive:hover {
		box-shadow: var(--shadow-md);
		transform: translateY(-1px);
	}

	h3 {
		margin: 0 0 var(--spacing-md);
		font-size: var(--font-size-h3);
		font-weight: var(--font-weight-semibold);
	}
</style>
