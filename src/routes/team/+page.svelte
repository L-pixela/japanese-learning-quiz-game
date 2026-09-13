<script lang="ts">
	import StudyShell from '$lib/components/StudyShell.svelte'
	import { team } from '$lib/team'
	import { t } from '$lib/i18n.svelte'

	// Fall back to the portrait placeholder if the artwork file is missing.
	let failed = $state<Record<string, boolean>>({})
</script>

<svelte:head
	><title>The people behind TanTore</title><meta
		name="description"
		content="Meet the student team building TanTore, a Japanese vocabulary practice app."
	/></svelte:head
>
<StudyShell>
	<div class="study-heading">
		<div>
			<p class="study-eyebrow">{t('team.eyebrow')}</p>
			<h1>{t('team.title')}</h1>
			<p class="study-muted">{t('team.lead')}</p>
		</div>
		<span class="study-stamp" lang="ja">仲間</span>
	</div>
	<div class="team-intro">
		<span lang="ja">共に学び、共に作る。</span>
		<p>{t('team.together')}</p>
		<span class="edition">TANTORE / TEAM NOTES</span>
	</div>
	<section class="team-grid" aria-label="Team members">
		{#each team as member, index (member.name)}<article class="member">
				<div class="portrait">
					{#if member.image && !failed[member.name]}<img
							src={member.image}
							alt={member.japanese + ' anime profile portrait'}
							onerror={() => (failed[member.name] = true)}
						/>{:else}<div
							class="portrait-frame"
							aria-label={'Profile image placeholder for ' + member.japanese}
						>
							<svg viewBox="0 0 120 140" fill="none" aria-hidden="true"
								><path
									d="M24 124c2-26 18-38 36-38s34 12 36 38M39 63c0-22 9-34 21-34s21 12 21 34-10 29-21 29-21-7-21-29Z"
									stroke="currentColor"
									stroke-width="1.2"
								/><path
									d="M35 67c-7-31 9-49 25-49 23 0 33 24 24 51l-8-25-12 11-8-13-18 25Z"
									fill="currentColor"
									opacity=".17"
								/><path
									d="M15 15h18M15 15v18M105 15H87M105 15v18M15 125h18M15 125v-18M105 125H87M105 125v-18"
									stroke="currentColor"
									opacity=".4"
								/></svg
							><span>{t('team.portraitPending')}</span>
						</div>{/if}<span class="member-index">{String(index + 1).padStart(2, '0')}</span>
				</div>
				<div class="member-info">
					<p class="study-eyebrow">{member.role}</p>
					<h2 lang="ja">{member.japanese}</h2>
					<p class="member-en">{member.name}</p>
					<p class="contribution">{member.contribution}</p>
				</div>
			</article>{/each}
	</section>
	<div class="team-note">
		<span lang="ja">ありがとう</span>
		<p>{t('team.thanks')}</p>
	</div>
</StudyShell>

<style>
	.team-intro {
		display: flex;
		flex-wrap: wrap;
		gap: 12px 22px;
		align-items: center;
		margin: 35px 0;
		padding: 24px 30px;
		border-radius: var(--radius-lg);
		background: var(--color-surface);
		box-shadow: var(--shadow-sm);
	}
	.team-intro > span:first-child {
		color: var(--color-primary);
		font-family: var(--font-display);
		font-size: var(--font-size-h3);
		font-weight: var(--font-weight-bold);
	}
	.team-intro p {
		color: var(--color-text-secondary);
		font-size: var(--font-size-caption);
		margin: 0;
	}
	.edition {
		margin-left: auto;
		font-size: var(--font-size-caption);
		letter-spacing: 1.6px;
		color: var(--color-text-secondary);
	}
	.team-grid {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 25px;
	}
	.member {
		border-radius: var(--radius-lg);
		background: var(--color-surface);
		box-shadow: var(--shadow-sm);
		overflow: hidden;
		transition: transform var(--duration-base) var(--ease-standard);
	}
	.member:hover {
		transform: translateY(-4px);
	}
	.portrait {
		position: relative;
		aspect-ratio: 1.18;
		background: var(--color-primary-soft);
		overflow: hidden;
	}
	.member:nth-child(3n + 2) .portrait {
		background: var(--color-surface);
	}
	.member:nth-child(3n) .portrait {
		background: var(--color-success-soft);
	}
	.portrait img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		/* Bias the crop upward so faces survive the wide frame. */
		object-position: center 25%;
	}
	.portrait-frame {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		height: 100%;
		color: var(--color-text-faint);
	}
	.portrait-frame svg {
		height: 57%;
		width: auto;
		margin-bottom: 8px;
	}
	.portrait-frame span {
		font-size: var(--text-sm);
		font-weight: var(--font-weight-semibold);
	}
	.member-index {
		position: absolute;
		top: 14px;
		left: 14px;
		padding: 5px 12px;
		border-radius: var(--radius-full);
		background: rgba(255, 248, 236, 0.92);
		color: var(--color-primary-active);
		font-size: var(--font-size-caption);
		font-weight: var(--font-weight-bold);
	}
	.member-info {
		padding: 25px;
	}
	.member-info h2 {
		margin-bottom: 6px;
		font-size: clamp(19px, 2.9vw, 26px);
		letter-spacing: 1px;
	}
	.member-en {
		color: var(--color-primary);
		font-size: var(--font-size-small);
		font-weight: var(--font-weight-semibold);
		letter-spacing: 0.6px;
	}
	.contribution {
		margin: 20px 0 0;
		padding-top: 18px;
		border-top: 1px solid var(--color-border-subtle);
		color: var(--color-text-secondary);
		font-size: var(--font-size-small);
		line-height: var(--line-height-normal);
	}
	.team-note {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 35px;
		padding: 50px 0 0;
	}
	.team-note > span {
		padding: 14px 26px;
		border-radius: var(--radius-full);
		background: var(--color-accent);
		color: var(--color-on-primary);
		box-shadow: var(--shadow-solid) var(--color-border-strong);
		font-family: var(--font-display);
		font-size: 24px;
		font-weight: var(--font-weight-bold);
	}
	.team-note p {
		margin: 0;
		color: var(--color-text-secondary);
		font-size: var(--font-size-small);
		line-height: var(--line-height-relaxed);
	}
	@media (max-width: 750px) {
		.team-grid {
			grid-template-columns: 1fr;
		}
		.portrait {
			aspect-ratio: 1.7;
		}
		.edition {
			margin-left: 0;
		}
		.team-note {
			flex-direction: column;
			gap: 15px;
			text-align: center;
		}
	}
</style>
