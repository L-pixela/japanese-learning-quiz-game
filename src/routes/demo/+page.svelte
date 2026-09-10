<script lang="ts">
	import RankBadge from '$lib/components/rank_badge.svelte'

	const mockStreaks = [0, 4, 9, 20, 45, 75, 120]
</script>

<main>
	<section>
		<div class="row">
			{#each mockStreaks as streak (streak)}
				<RankBadge {streak} size="lg" showLabel />
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