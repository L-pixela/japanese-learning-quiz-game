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
		color: #352d23;
		font-size: 0.9rem;
		font-weight: 850;
	}

	input {
		width: 100%;
		box-sizing: border-box;
		border: 1px solid #d8c7ad;
		border-radius: 6px;
		background: #fffaf0;
		padding: 0.9rem 0.95rem;
		color: #29231c;
		font: inherit;
		font-weight: 650;
		outline: none;
		transition:
			border-color 140ms ease,
			box-shadow 140ms ease,
			background 140ms ease;
	}

	input::placeholder {
		color: #9a8a70;
		font-weight: 600;
	}

	input:focus {
		border-color: #6e8f63;
		background: #ffffff;
		box-shadow: 0 0 0 3px rgba(110, 143, 99, 0.17);
	}

	input[aria-invalid='true'] {
		border-color: #c43d3d;
		box-shadow: 0 0 0 3px rgba(196, 61, 61, 0.12);
	}

	.field-error {
		color: #a43333;
		font-size: 0.85rem;
		font-weight: 800;
		line-height: 1.45;
	}
</style>
