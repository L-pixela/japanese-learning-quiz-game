<script lang="ts">
	import type { Snippet } from 'svelte'

	type Variant = 'primary' | 'success' | 'error' | 'warning'

	type Props = {
		variant?: Variant
		children?: Snippet
	}

	let { variant = 'primary', children }: Props = $props()
</script>

<span class="badge badge--{variant}">
	{@render children?.()}
</span>

<style>
	.badge {
		display: inline-flex;
		align-items: center;
		padding: var(--spacing-xs) var(--spacing-sm);
		border-radius: var(--radius-full);
		font-family: var(--font-family);
		font-size: var(--font-size-caption);
		font-weight: var(--font-weight-semibold);
		line-height: var(--line-height-tight);
	}

	.badge--primary {
		background-color: var(--color-primary);
		color: #ffffff;
	}

	.badge--success {
		background-color: var(--color-success);
		color: #ffffff;
	}

	.badge--error {
		background-color: var(--color-error);
		color: #ffffff;
	}

	.badge--warning {
		background-color: var(--color-warning);
		color: #292522;
	}
</style>
