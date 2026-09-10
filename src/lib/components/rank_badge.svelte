<script lang="ts">
	import { getRankFromStreak, type RankTier } from './ranks'

	type Size = 'sm' | 'md' | 'lg'

	type Props = {
		streak?: number
		rank?: RankTier
		size?: Size
		showLabel?: boolean
	}

	let { streak = 0, rank, size = 'md', showLabel = false }: Props = $props()

	let resolvedRank = $derived(rank ?? getRankFromStreak(streak))

	const SIZES: Record<Size, { circle: number; img: number; ring: number }> = {
		sm: { circle: 28, img: 15, ring: 2 },
		md: { circle: 64, img: 40, ring: 3 },
		lg: { circle: 104, img: 72, ring: 4 },
	}

	let dims = $derived(SIZES[size])
</script>

<div class="rank-badge-wrap">
	<div
		class="rank-badge"
		class:rank-badge--sm={size === 'sm'}
		style:--circle-size="{dims.circle}px"
		style:--img-size="{dims.img}px"
		style:--ring-width="{dims.ring}px"
		style:--ring-color={resolvedRank.ringColor}
		title="{resolvedRank.name} ({resolvedRank.nameJp})"
		role="img"
		aria-label="{resolvedRank.name} rank badge"
	>
		<img src={resolvedRank.image} alt={resolvedRank.name} loading="lazy" />
	</div>

	{#if showLabel}
		<div class="rank-badge-label">
			<span class="rank-badge-name">{resolvedRank.name}</span>
			<span class="rank-badge-jp">{resolvedRank.nameJp}</span>
		</div>
	{/if}
</div>

<style>
	.rank-badge-wrap {
		display: inline-flex;
		flex-direction: column;
		align-items: center;
		gap: 0.4rem;
	}

	.rank-badge {
		width: var(--circle-size);
		height: var(--circle-size);
		border-radius: 50%;
		background: #fbf7ec;
		display: flex;
		align-items: center;
		justify-content: center;
		box-shadow:
			inset 0 0 0 4px #fff,
			0 0 0 var(--ring-width) var(--ring-color),
			0 4px 10px rgba(0, 0, 0, 0.18);
		overflow: hidden;
		flex-shrink: 0;
	}

	.rank-badge--sm {
		box-shadow:
			inset 0 0 0 2px #fff,
			0 0 0 var(--ring-width) var(--ring-color);
	}

	.rank-badge img {
		width: var(--img-size);
		height: var(--img-size);
		object-fit: contain;
	}

	.rank-badge-label {
		display: flex;
		flex-direction: column;
		align-items: center;
		line-height: 1.2;
	}

	.rank-badge-name {
		font-weight: 800;
		font-size: 0.8rem;
	}

	.rank-badge-jp {
		font-size: 0.7rem;
		color: #6b6656;
	}
</style>
