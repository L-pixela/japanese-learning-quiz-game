<script lang="ts">
	import { resolve } from '$app/paths'
	import StudyShell from '$lib/components/StudyShell.svelte'
	import type { PageData } from './$types'
	let { data }: { data: PageData } = $props()
	const rankNames: Record<string, string> = {
		shiragohan: '白ご飯 · Shiragohan',
		umeboshi: '梅干し · Umeboshi',
		mentaiko: '明太子 · Mentaiko',
		wasabi: 'わさび · Wasabi',
		'ichimi-togarashi': '一味唐辛子 · Ichimi',
		'gekikara-kimchi': '激辛キムチ · Gekikara',
		hinotama: '火の玉 · Hinotama',
	}
	let completed = $derived(data.levels.filter((level) => level.status === 'completed').length)
	let next = $derived(data.levels.find((level) => level.status !== 'completed') ?? data.levels[0])
</script>

<svelte:head
	><title>Your study desk · TanTore</title><meta
		name="description"
		content="Your daily Japanese vocabulary practice. Ten levels, one small step at a time."
	/></svelte:head
>
<StudyShell>
	<div class="study-heading">
		<div>
			<p class="study-eyebrow">Your study desk / 学びの時間</p>
			<h1>Welcome back, {data.user.username}.</h1>
			<p class="study-muted">
				A few words today. A little further tomorrow.{#if data.user.university}
					<span class="university">{data.user.university}</span>{/if}
			</p>
		</div>
		<span class="study-stamp" lang="ja" aria-hidden="true">日々精進</span>
	</div>
	<section class="study-metrics" aria-label="Your learning summary">
		<div class="study-metric">
			<small>Total points</small><strong>{data.user.points.toLocaleString()}</strong><span
				>Every correct answer counts</span
			>
		</div>
		<div class="study-metric">
			<small>Current streak</small><strong>{data.user.streak}<span> days</span></strong><span
				>Keep your daily rhythm</span
			>
		</div>
		<div class="study-metric">
			<small>Current rank</small><strong
				class="rank-icon"
				role="img"
				aria-label={(rankNames[data.user.rank] ?? data.user.rank) + ' rank badge'}
				>{(rankNames[data.user.rank] ?? '学')[0]}</strong
			><span class="rank-label">{rankNames[data.user.rank] ?? data.user.rank}</span>
		</div>
		<div class="study-metric">
			<small>Leaderboard position</small><strong>{data.position ? '#' + data.position : '—'}</strong
			><span>Among all learners</span>
		</div>
	</section>
	<section class="practice-hero">
		<div class="hero-copy">
			<p class="study-eyebrow">Vocabulary practice / 単語の稽古</p>
			<h2>Small steps.<br />Lasting knowledge.</h2>
			<p>
				Find your rhythm with ten Japanese words.<br />Choose a level, take a breath, and begin.
			</p>
			<a class="study-button" href={resolve('/quiz', {})}
				>Start Quiz <span aria-hidden="true">↗</span></a
			>
			<div class="hero-meta">
				<span>10 questions</span><span>6 correct to pass</span><span>N4 → N3</span>
			</div>
		</div>
		<div class="hero-art" aria-hidden="true">
			<div class="sun"></div>
			<div class="mountain mountain-back"></div>
			<div class="mountain"></div>
			<div class="art-caption" lang="ja">一日一歩<span>ONE STEP, EVERY DAY</span></div>
			<div class="art-seal">学</div>
		</div>
	</section>
	<div class="bottom-grid">
		<section class="study-panel journey">
			<div class="section-line">
				<h2>Your path</h2>
				<span>{completed} / 10 complete</span>
			</div>
			<div class="mini-path" aria-label={completed + ' of 10 levels completed'}>
				{#each data.levels as level (level.level)}<a
						href={resolve('/quiz/[level]', { level: String(level.level) })}
						class:done={level.status === 'completed'}
						class:attempted={level.status === 'attempted'}
						aria-label={'Level ' + level.level + ': ' + level.status.replace('_', ' ')}
						>{level.status === 'completed' ? '✓' : level.level}</a
					>{/each}
			</div>
			<p class="study-muted">
				{completed === 10
					? 'The whole path is yours. Return to any level to keep practicing.'
					: 'Up next: Level ' + next.level + ' · ' + next.name}
			</p>
			<a class="text-link" href={resolve('/quiz', {})}>Explore the level map <span>→</span></a>
		</section>
		<section class="study-panel">
			<div class="section-line">
				<h2>Alongside you</h2>
				<span>TOP LEARNERS</span>
			</div>
			<ol class="leaders">
				{#each data.leaderboard as learner (learner.id)}<li>
						<span class="position">{String(learner.position).padStart(2, '0')}</span><span
							>{learner.username}{learner.id === data.user.id ? ' (you)' : ''}</span
						><span>{learner.points.toLocaleString()} <small>pt</small></span>
					</li>{/each}
			</ol>
		</section>
	</div>
	<a class="deck-link" href={resolve('/deck_list', {})}
		><span>Prefer your own vocabulary?</span> Browse your decks <span aria-hidden="true">↗</span></a
	>
</StudyShell>

<style>
	.university {
		display: inline-block;
		margin-left: 8px;
		font-size: 12px;
	}
	.rank-icon {
		color: #aa4235;
		font-family: 'Yu Mincho', serif;
		font-size: 22px;
		width: 35px;
		height: 35px;
		border: 1px solid currentColor;
		border-radius: 50%;
		text-align: center;
		line-height: 33px;
		margin-bottom: 4px;
	}
	.rank-label {
		font-size: 11px !important;
	}
	.practice-hero {
		display: grid;
		grid-template-columns: 1.15fr 1fr;
		border: 1px solid #d9d9cb;
		background: #eeeee1;
		overflow: hidden;
		min-height: 350px;
	}
	.hero-copy {
		padding: 40px;
		position: relative;
		z-index: 1;
	}
	.hero-copy h2 {
		font-family: Georgia, 'Yu Mincho', serif;
		font-size: clamp(36px, 4.4vw, 54px);
		line-height: 1.08;
		letter-spacing: -2px;
		margin-bottom: 20px;
	}
	.hero-copy > p:not(.study-eyebrow) {
		font-size: 14px;
		line-height: 1.8;
		color: #62695f;
		margin-bottom: 24px;
	}
	.hero-meta {
		display: flex;
		flex-wrap: wrap;
		gap: 16px;
		font-size: 10px;
		color: #62695f;
		margin-top: 22px;
	}
	.hero-art {
		position: relative;
		min-height: 300px;
		overflow: hidden;
		background-image: repeating-linear-gradient(90deg, transparent 0 49px, #d7d8c94d 49px 50px);
	}
	.sun {
		position: absolute;
		width: 160px;
		height: 160px;
		border-radius: 50%;
		background: #bc5845;
		top: 50px;
		left: 30%;
	}
	.mountain {
		position: absolute;
		width: 440px;
		height: 270px;
		bottom: -70px;
		left: -30px;
		background: #466452;
		clip-path: polygon(0 100%, 49% 0, 100% 100%);
	}
	.mountain-back {
		left: 150px;
		bottom: -40px;
		background: #a3b09a;
	}
	.art-caption {
		position: absolute;
		right: 35px;
		top: 35px;
		writing-mode: vertical-rl;
		font-family: 'Yu Mincho', serif;
		letter-spacing: 9px;
		font-size: 22px;
	}
	.art-caption span {
		font-family: sans-serif;
		font-size: 8px;
		letter-spacing: 2px;
		margin-right: 13px;
	}
	.art-seal {
		position: absolute;
		left: 20px;
		bottom: 25px;
		border: 1px solid #f9f5e2;
		color: #f9f5e2;
		padding: 4px 8px;
		font-family: serif;
	}
	.bottom-grid {
		display: grid;
		grid-template-columns: 1.15fr 1fr;
		gap: 24px;
		margin-top: 24px;
	}
	.section-line {
		display: flex;
		align-items: baseline;
		justify-content: space-between;
		gap: 10px;
	}
	.section-line h2 {
		font-size: 22px;
	}
	.section-line > span {
		font-size: 10px;
		color: #62695f;
	}
	.mini-path {
		display: flex;
		gap: 7px;
		margin: 12px 0 20px;
	}
	.mini-path a {
		display: grid;
		place-items: center;
		width: 32px;
		height: 34px;
		border: 1px solid #cdd0c5;
		background: #e9e9e1;
		text-decoration: none;
		font-size: 11px;
	}
	.mini-path a.done {
		background: #37664d;
		border-color: #37664d;
		color: white;
	}
	.mini-path a.attempted {
		background: #efdb92;
		border-color: #b49b48;
	}
	.text-link {
		display: flex;
		justify-content: space-between;
		font-size: 12px;
		text-decoration: none;
		border-top: 1px solid #d9d9cb;
		padding-top: 16px;
	}
	.leaders {
		list-style: none;
		padding: 0;
		margin: 0;
	}
	.leaders li {
		display: grid;
		grid-template-columns: 25px minmax(0, 1fr) auto;
		gap: 10px;
		padding: 9px 0;
		border-bottom: 1px solid #e6e6dc;
		font-size: 12px;
	}
	.leaders .position,
	.leaders small {
		color: #858779;
		font-size: 10px;
	}
	.leaders li > span {
		overflow-wrap: anywhere;
	}
	.deck-link {
		display: flex;
		gap: 8px;
		justify-content: end;
		margin-top: 26px;
		font-size: 12px;
		text-decoration: none;
	}
	.deck-link > span:first-child {
		color: #62695f;
	}
	@media (max-width: 800px) {
		.hero-copy {
			padding: 28px;
		}
		.bottom-grid {
			grid-template-columns: 1fr;
		}
	}
	@media (max-width: 550px) {
		.practice-hero {
			grid-template-columns: 1fr;
		}
		.hero-art {
			min-height: 210px;
		}
		.sun {
			top: 10px;
			width: 120px;
			height: 120px;
		}
		.hero-meta {
			gap: 12px;
		}
		.mini-path {
			gap: 4px;
		}
		.deck-link {
			flex-wrap: wrap;
			justify-content: start;
		}
	}
</style>
