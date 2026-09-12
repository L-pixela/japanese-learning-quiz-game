<script lang="ts">
	import Card from '$lib/components/card.svelte'
	import RankBadge from '$lib/components/rank_badge.svelte'

	type Props = {
		streak: number
		title?: string
		description?: string
		compact?: boolean
	}

	let {
		streak,
		title = 'Your current rank / 現在のランク',
		description = 'Keep practicing to grow your rank. / 練習を続けてランクを上げましょう。',
		compact = false,
	}: Props = $props()
</script>

<div class="rank-card-shell" class:rank-card-shell--compact={compact}>
	<Card>
		<section class="rank-panel" aria-labelledby="current-rank-title">
			<div class="section-heading">
				<div>
					<span class="metric-label">CURRENT RANK / 現在のランク</span>
					<h2 id="current-rank-title">{title}</h2>
				</div>
				<RankBadge {streak} size="md" showLabel />
			</div>
			<p>{description}</p>
		</section>
	</Card>
</div>

<style>
	.rank-card-shell :global(.card) {
		height: 100%;
	}

	.rank-card-shell--compact :global(.card) {
		padding: var(--spacing-md);
	}
	.rank-panel {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-md);
	}
	.section-heading {
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		gap: var(--spacing-md);
	}
	.metric-label {
		color: var(--color-text-secondary);
		font-size: var(--font-size-caption);
		font-weight: var(--font-weight-bold);
		letter-spacing: 0.1em;
	}
	h2 {
		margin: var(--spacing-xs) 0 0;
		font-size: var(--font-size-h3);
	}
	.rank-card-shell--compact h2 {
		font-size: var(--font-size-body);
	}
	p {
		margin: 0;
		color: var(--color-text-secondary);
		font-size: var(--font-size-small);
	}
</style>
