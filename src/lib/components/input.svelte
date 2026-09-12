<script lang="ts">
	type Props = {
		id?: string
		label?: string
		placeholder?: string
		type?: 'text' | 'email' | 'password' | 'number'
		disabled?: boolean
	}

	let {
		id = 'design-system-input',
		label,
		placeholder = '',
		type = 'text',
		disabled = false,
	}: Props = $props()
</script>

<div class="input-wrapper">
	{#if label}
		<label for={id}>{label}</label>
	{/if}

	<input {id} {type} {placeholder} {disabled} />
</div>

<style>
	.input-wrapper {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-xs);
	}

	label {
		color: var(--color-text);
		font-size: var(--font-size-small);
		font-weight: var(--font-weight-medium);
	}

	input {
		width: 100%;
		box-sizing: border-box;
		padding: var(--spacing-sm) var(--spacing-md);
		background-color: var(--color-surface);
		color: var(--color-text);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
		font-family: var(--font-family);
		font-size: var(--font-size-body);
		outline: none;
		transition:
			border-color var(--duration-fast) var(--ease-standard),
			box-shadow var(--duration-fast) var(--ease-standard);
	}

	input:focus {
		border-color: var(--color-primary);
		box-shadow: 0 0 0 3px color-mix(in srgb, var(--color-focus-ring) 20%, transparent);
	}

	input:disabled {
		background-color: var(--color-disabled-bg);
		color: var(--color-disabled-text);
		cursor: not-allowed;
	}

	input::placeholder {
		color: var(--color-text-secondary);
	}
</style>
