<script lang="ts">
	import { resolve } from '$app/paths'
	import StudyShell from '$lib/components/StudyShell.svelte'
	import RankBadge from '$lib/components/rank_badge.svelte'
	import { t } from '$lib/i18n.svelte'
	import type { PageData } from './$types'

	let { data }: { data: PageData } = $props()
	let name = $derived(data.profile.displayName || data.profile.username)
</script>

<svelte:head><title>{name} · TanTore</title></svelte:head>
<StudyShell>
	<div class="study-heading">
		<div class="identity">
			{#if data.profile.avatar}
				<img class="avatar" src={data.profile.avatar} alt="" />
			{:else}
				<span class="avatar placeholder" aria-hidden="true">{name.slice(0, 1).toUpperCase()}</span>
			{/if}
			<div>
				<p class="study-eyebrow">{t('profile.publicEyebrow')}</p>
				<h1>{name}</h1>
				<p class="study-muted">@{data.profile.username}</p>
			</div>
		</div>
		<a class="study-button secondary" href={resolve('/dashboard', {})}
			>{t('profile.backToLeaderboard')}</a
		>
	</div>

	<section class="study-metrics" aria-label={t('profile.publicTitle')}>
		<div class="study-metric">
			<small>{t('profile.points')}</small><strong>{data.profile.points.toLocaleString()}</strong>
		</div>
		<div class="study-metric">
			<small>{t('profile.streak')}</small><strong
				>{data.profile.streak}<span> {t('dashboard.streakDays')}</span></strong
			>
		</div>
		<div class="study-metric">
			<small>{t('profile.rank')}</small>
			<RankBadge points={data.profile.points} size="md" />
		</div>
	</section>

	<section class="study-panel profile-panel">
		<div class="panel-head">
			<h2>{t('profile.about')}</h2>
		</div>
		<dl class="details">
			<div>
				<dt>{t('profile.displayName')}</dt>
				<dd>{data.profile.displayName || t('profile.notSet')}</dd>
			</div>
			<div>
				<dt>{t('auth.university')}</dt>
				<dd>{data.profile.university || t('profile.notSet')}</dd>
			</div>
			<div>
				<dt>{t('profile.linkedin')}</dt>
				<dd>{data.profile.linkedin || t('profile.notSet')}</dd>
			</div>
			<div>
				<dt>{t('profile.github')}</dt>
				<dd>{data.profile.github || t('profile.notSet')}</dd>
			</div>
			<div class="wide">
				<dt>{t('profile.bio')}</dt>
				<dd>{data.profile.bio || t('profile.notSet')}</dd>
			</div>
		</dl>
	</section>
</StudyShell>

<style>
	.identity {
		display: flex;
		align-items: center;
		gap: var(--spacing-md);
		min-width: 0;
	}
	.avatar {
		width: 84px;
		height: 84px;
		flex-shrink: 0;
		border-radius: var(--radius-full);
		object-fit: cover;
		background: var(--color-primary-soft);
	}
	.placeholder {
		display: grid;
		place-items: center;
		background: var(--color-primary);
		color: var(--color-on-primary);
		font-family: var(--font-display);
		font-size: var(--text-2xl);
		font-weight: var(--font-weight-bold);
	}
	.profile-panel {
		max-width: 760px;
	}
	.panel-head {
		margin-bottom: var(--spacing-lg);
	}
	.details {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: var(--spacing-md) var(--spacing-lg);
		margin: 0;
	}
	.details .wide {
		grid-column: 1 / -1;
	}
	dt {
		margin-bottom: 4px;
		color: var(--color-text-secondary);
		font-size: var(--text-sm);
		font-weight: var(--font-weight-semibold);
	}
	dd {
		margin: 0;
		font-size: var(--text-base);
		overflow-wrap: anywhere;
	}
	@media (max-width: 820px) {
		.study-heading :global(.study-button) {
			width: auto;
		}
	}
	@media (max-width: 540px) {
		.details {
			grid-template-columns: 1fr;
		}
		.details .wide {
			grid-column: auto;
		}
		.study-heading :global(.study-button) {
			width: 100%;
		}
	}
</style>
