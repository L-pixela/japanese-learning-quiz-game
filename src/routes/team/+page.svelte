<script lang="ts">
	import StudyShell from '$lib/components/StudyShell.svelte'
	import { team } from '$lib/team'

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
			<p class="study-eyebrow">The people behind the practice / 制作チーム</p>
			<h1>Made together.<br />For the way we learn.</h1>
			<p class="study-muted">
				We’re building a small space for a daily Japanese habit.<br />These are the people bringing
				TanTore to life.
			</p>
		</div>
		<span class="study-stamp" lang="ja">仲間</span>
	</div>
	<div class="team-intro">
		<span lang="ja">共に学び、共に作る。</span>
		<p>Learning together. Building together.</p>
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
							><span>PORTRAIT TO COME</span><small>Anime profile space</small>
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
		<p>
			To everyone learning, testing, and sharing ideas with us.<br />Thank you for being part of the
			journey.
		</p>
	</div>
</StudyShell>

<style>
	.team-intro {
		display: flex;
		flex-wrap: wrap;
		gap: 12px 22px;
		align-items: center;
		border-block: 1px solid #d9d9cb;
		padding: 22px 0;
		margin: 35px 0;
	}
	.team-intro > span:first-child {
		font-family: 'Yu Mincho', serif;
		font-size: 19px;
	}
	.team-intro p {
		color: #62695f;
		font-size: 11px;
		margin: 0;
	}
	.edition {
		margin-left: auto;
		font-size: 9px;
		letter-spacing: 1.6px;
		color: #62695f;
	}
	.team-grid {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 25px;
	}
	.member {
		border: 1px solid #d9d9cb;
		background: #fcfaf3;
	}
	.portrait {
		background: #e8ecdf;
		position: relative;
		aspect-ratio: 1.18;
		overflow: hidden;
	}
	.member:nth-child(3n + 2) .portrait {
		background: #eee4d8;
	}
	.member:nth-child(3n) .portrait {
		background: #e4e7e4;
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
		color: #6c7965;
	}
	.portrait-frame svg {
		height: 57%;
		width: auto;
		margin-bottom: 8px;
	}
	.portrait-frame span {
		font-size: 8px;
		letter-spacing: 2px;
	}
	.portrait-frame small {
		font-size: 10px;
		margin-top: 5px;
	}
	.member-index {
		position: absolute;
		top: 16px;
		left: 18px;
		font-size: 10px;
		color: #62695f;
	}
	.member-info {
		padding: 25px;
	}
	.member-info h2 {
		font-size: 23px;
		margin-bottom: 8px;
		letter-spacing: 1.5px;
	}
	.member-en {
		font-size: 12px;
		color: #62695f;
		letter-spacing: 1.4px;
	}
	.contribution {
		border-top: 1px solid #d9d9cb;
		padding-top: 18px;
		margin: 20px 0 0;
		font-size: 12px;
		color: #62695f;
		line-height: 1.6;
	}
	.team-note {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 35px;
		padding: 50px 0 0;
	}
	.team-note > span {
		color: #aa4235;
		font-family: 'Yu Mincho', serif;
		font-size: 23px;
	}
	.team-note p {
		margin: 0;
		font-size: 12px;
		color: #62695f;
		line-height: 1.8;
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
