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
		showPasswordToggle?: boolean
	}

	let {
		id,
		label,
		name,
		type = 'text',
		value = $bindable(),
		autocomplete,
		error = '',
		showPasswordToggle = false,
	}: Props = $props()

	let passwordVisible = $state(false)
	const inputType = $derived(showPasswordToggle && passwordVisible ? 'text' : type)
</script>

<label class="text-field" for={id}>
	<span>{label}</span>
	<span class="input-wrapper">
		<input
			{id}
			bind:value
			class:password-input={showPasswordToggle}
			type={inputType}
			{name}
			{autocomplete}
			aria-invalid={Boolean(error)}
			aria-describedby={error ? `${id}-error` : undefined}
		/>
		{#if showPasswordToggle}
			<button
				type="button"
				class="password-toggle"
				aria-label={passwordVisible ? 'Hide password' : 'Show password'}
				aria-pressed={passwordVisible}
				onclick={() => (passwordVisible = !passwordVisible)}
			>
				<svg viewBox="0 0 24 24" aria-hidden="true">
					{#if passwordVisible}
						<path d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z" />
						<circle cx="12" cy="12" r="2.5" />
					{:else}
						<path
							d="m3 3 18 18M10.6 6.2C11.1 6.1 11.5 6 12 6c6 0 9.5 6 9.5 6a18 18 0 0 1-3.1 3.8M6.1 6.9C3.8 8.5 2.5 12 2.5 12s3.5 6 9.5 6c1.2 0 2.3-.2 3.3-.6"
						/>
					{/if}
				</svg>
			</button>
		{/if}
	</span>
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

	.input-wrapper {
		position: relative;
		display: block;
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

	input.password-input {
		padding-right: 3.25rem;
	}

	.password-toggle {
		position: absolute;
		top: 50%;
		right: 0.75rem;
		display: grid;
		place-items: center;
		width: 2rem;
		height: 2rem;
		border: 0;
		border-radius: var(--radius-sm);
		background: transparent;
		color: var(--color-text-secondary);
		font: inherit;
		font-size: 1.1rem;
		line-height: 1;
		cursor: pointer;
		transform: translateY(-50%);
	}

	.password-toggle svg {
		width: 1.25rem;
		height: 1.25rem;
		fill: none;
		stroke: currentColor;
		stroke-linecap: round;
		stroke-linejoin: round;
		stroke-width: 1.8;
	}

	.password-toggle:hover {
		background: var(--color-disabled-bg);
		color: var(--color-text);
	}

	.password-toggle:focus-visible {
		outline: 2px solid var(--color-focus-ring);
		outline-offset: 2px;
	}

	.field-error {
		color: var(--color-error);
		font-size: 0.85rem;
		font-weight: 800;
		line-height: 1.45;
	}
</style>
