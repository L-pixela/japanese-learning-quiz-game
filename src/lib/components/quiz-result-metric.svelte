<script lang="ts">
	import Card from '$lib/components/card.svelte'

	type Tone = 'accent' | 'success'

	type Props = {
		label: string
		value: string | number
		note: string
		icon: string
		tone?: Tone
		compact?: boolean
	}

	let { label, value, note, icon, tone = 'accent', compact = false }: Props = $props()
</script>

<div class="metric-card-shell" class:metric-card-shell--compact={compact}>
	<Card>
		<div class="metric-card">
			<div class="metric-icon metric-icon--{tone}" aria-hidden="true">{icon}</div>
			<div>
				<span class="metric-label">{label}</span>
				<strong class="metric-value">{value}</strong>
				<span class="metric-note">{note}</span>
			</div>
		</div>
	</Card>
</div>

<style>
	.metric-card-shell :global(.card) {
		height: 100%;
		padding: var(--spacing-lg);
	}

	.metric-card-shell--compact :global(.card) {
		padding: var(--spacing-md);
	}

	.metric-card {
		display: flex;
		align-items: center;
		gap: var(--spacing-md);
	}

	.metric-icon {
		display: grid;
		place-items: center;
		width: 2.8rem;
		height: 2.8rem;
		flex: 0 0 auto;
		border-radius: var(--radius-full);
		font-size: 1.5rem;
		font-weight: var(--font-weight-bold);
	}

	.metric-icon--accent {
		background: color-mix(in srgb, var(--color-accent) 18%, var(--color-surface));
		color: var(--color-accent-strong);
	}

	.metric-icon--success {
		background: color-mix(in srgb, var(--color-success) 18%, var(--color-surface));
		color: var(--color-primary-active);
	}

	.metric-label {
		display: block;
		color: var(--color-text-secondary);
		font-size: var(--font-size-caption);
		font-weight: var(--font-weight-bold);
		letter-spacing: 0.1em;
	}

	.metric-value {
		display: block;
		margin-top: var(--spacing-xs);
		font-size: var(--font-size-h2);
	}

	.metric-note {
		display: block;
		margin-top: var(--spacing-xs);
		color: var(--color-text-secondary);
		font-size: var(--font-size-caption);
	}
</style>
