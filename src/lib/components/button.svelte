<script lang="ts">
	import type { Snippet } from 'svelte'

	type Variant = 'primary' | 'secondary' | 'success' | 'error'
	type Size = 'sm' | 'md' | 'lg'

	type Props = {
		variant?: Variant
		size?: Size
		disabled?: boolean
		type?: 'button' | 'submit' | 'reset'
		children?: Snippet
	}

	let {
		variant = 'primary',
		size = 'md',
		disabled = false,
		type = 'button',
		children,
	}: Props = $props()
</script>

<button {type} class="button button--{variant} button--{size}" {disabled}>
	{@render children?.()}
</button>

<style>
	.button {
		border: none;
		font-family: var(--font-family);
		font-weight: var(--font-weight-semibold);
		cursor: pointer;
		transition:
			background-color var(--duration-fast) var(--ease-standard),
			opacity var(--duration-fast) var(--ease-standard),
			box-shadow var(--duration-fast) var(--ease-standard);
	}

	.button--sm {
		padding: var(--spacing-xs) var(--spacing-sm);
		font-size: var(--font-size-small);
		border-radius: var(--radius-sm);
	}

	.button--md {
		padding: var(--spacing-sm) var(--spacing-md);
		font-size: var(--font-size-body);
		border-radius: var(--radius-md);
	}

	.button--lg {
		padding: var(--spacing-md) var(--spacing-lg);
		font-size: var(--font-size-body);
		border-radius: var(--radius-md);
	}

	.button--primary {
		background-color: var(--color-primary);
		color: #ffffff;
	}

	.button--primary:not(:disabled):hover {
		background-color: var(--color-primary-hover);
	}

	.button--primary:not(:disabled):active {
		background-color: var(--color-primary-active);
	}

	.button--secondary {
		background-color: var(--color-surface);
		color: var(--color-text);
		border: 1px solid var(--color-border);
	}

	.button--secondary:not(:disabled):hover {
		background-color: var(--color-background);
		border-color: var(--color-text-secondary);
	}

	.button--success {
		background-color: var(--color-success);
		color: #ffffff;
	}

	.button--warning {
		background-color: var(--color-warning);
		color: #292522;
	}

	.button--warning:not(:disabled):hover {
		opacity: 0.85;
	}

	.button--error {
		background-color: var(--color-error);
		color: #ffffff;
	}

	.button--success:not(:disabled):hover,
	.button--error:not(:disabled):hover {
		opacity: 0.85;
	}

	.button:focus-visible {
		outline: 2px solid var(--color-focus-ring);
		outline-offset: 2px;
	}

	.button:disabled {
		background-color: var(--color-disabled-bg);
		color: var(--color-disabled-text);
		border-color: var(--color-disabled-bg);
		cursor: not-allowed;
	}
</style>
