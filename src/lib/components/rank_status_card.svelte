<script lang="ts">
	import RankBadge from '$lib/components/rank_badge.svelte'
	import Points from '$lib/components/points.svelte'
	import StreakCount from '$lib/components/streak_count.svelte'
	import { getRankFromStreak } from '$lib/components/ranks'

	type Props = {
		streak: number
		points: number
	}

	let { streak, points }: Props = $props()

	let rank = $derived(getRankFromStreak(streak))
</script>

<div class="status-banner">
	<div class="rank-container">
		<RankBadge {rank} size="lg" showLabel />
	</div>

	<div class="status-stats">
		<div class="stat-item">
			<Points {points} size="md" />
		</div>
		<div class="stat-divider"></div>
		<div class="stat-item">
			<StreakCount {streak} size="md" />
		</div>
	</div>
</div>

<style>
	.status-banner {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--spacing-lg);
		background: var(--color-surface);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-lg);
		box-shadow: var(--shadow-sm);
		padding: var(--spacing-lg) var(--spacing-xl);
	}

	.rank-container {
		display: flex;
		align-items: center;
	}

	.status-stats {
		display: flex;
		align-items: center;
		gap: var(--spacing-lg);
	}

	.stat-divider {
		width: 1px;
		height: 24px;
		background-color: var(--color-border);
	}

	@media (max-width: 600px) {
		.status-banner {
			flex-direction: column;
			align-items: stretch;
			gap: var(--spacing-md);
		}

		.rank-container {
			justify-content: center;
		}

		.status-stats {
			justify-content: space-evenly;
			width: 100%;
			padding-top: var(--spacing-md);
			border-top: 1px solid var(--color-border);
		}

		.stat-divider {
			display: none;
		}
	}
</style>
