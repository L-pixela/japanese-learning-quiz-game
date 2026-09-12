<script lang="ts">
	import type { HTMLInputAttributes } from 'svelte/elements'

	type Props = {
		id: string
		label: string
		name: string
		type?: 'text' | 'password'
		value: string
		autocomplete?: HTMLInputAttributes['autocomplete']
		error?: string
	}

	let {
		id,
		label,
		name,
		type = 'text',
		value = $bindable(),
		autocomplete,
		error = '',
	}: Props = $props()
</script>

<label class="text-field" for={id}>
	<span>{label}</span>
	<input
		{id}
		bind:value
		{type}
		{name}
		{autocomplete}
		aria-invalid={Boolean(error)}
		aria-describedby={error ? `${id}-error` : undefined}
	/>
	{#if error}
		<small id={`${id}-error`} class="field-error">{error}</small>
	{/if}
</label>

<style>
	.text-field {
		display: grid;
		gap: 0.4rem;
		color: var(--color-text);
		font-size: 0.9rem;
		font-weight: var(--font-weight-bold);
	}

	input {
		width: 100%;
		box-sizing: border-box;
		border: 1px solid var(--color-input-border);
		border-radius: var(--radius-md);
		background: var(--color-surface);
		padding: 0.9rem 0.95rem;
		color: var(--color-text);
		font: inherit;
		font-weight: var(--font-weight-medium);
		outline: none;
		transition:
			border-color 140ms ease,
			box-shadow 140ms ease,
			background 140ms ease;
	}

	input::placeholder {
		color: var(--color-disabled-text);
		font-weight: var(--font-weight-medium);
	}

	input:focus {
		border-color: var(--color-primary);
		background: var(--color-surface-raised);
		box-shadow: 0 0 0 3px color-mix(in srgb, var(--color-focus-ring) 17%, transparent);
	}

	input[aria-invalid='true'] {
		border-color: var(--color-error);
		box-shadow: 0 0 0 3px color-mix(in srgb, var(--color-error) 12%, transparent);
	}

	.field-error {
		color: var(--color-error);
		font-size: 0.85rem;
		font-weight: 800;
		line-height: 1.45;
	}
</style>
