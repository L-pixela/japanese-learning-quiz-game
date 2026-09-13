<script lang="ts">
	import RankBadge from '$lib/components/rank_badge.svelte'

	const mockPoints = [0, 12, 25, 35, 50, 70, 90]
</script>

<main>
	<section>
		<div class="row">
			{#each mockPoints as points (points)}
				<RankBadge {points} size="lg" showLabel />
			{/each}
		</div>
	</section>
</main>

<style>
	main {
		max-width: 800px;
		margin: 0 auto;
		padding: 2rem 1rem;
		font-family: sans-serif;
	}

	section {
		margin-bottom: 2.5rem;
	}

	.row {
		display: flex;
		gap: 1.5rem;
		flex-wrap: wrap;
	}
</style>
