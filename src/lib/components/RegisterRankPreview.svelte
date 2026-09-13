<script lang="ts">
	type Props = {
		titleId?: string
	}

	let { titleId }: Props = $props()
</script>

<div class="preview">
	<div class="starter-rank">
		<div class="rank-emblem" style:--rank-color="var(--color-border-strong)" aria-hidden="true">
			<span>米</span>
		</div>
		<div>
			<p class="caption">今日の始まり</p>
			<h1 id={titleId}>Create your study account</h1>
			<p class="intro">
				Build Anki-style vocab decks, review every day, and let your food rank grow with your
				streak.
			</p>
		</div>
	</div>
</div>

<style>
	.preview {
		display: flex;
		flex: 1;
		flex-direction: column;
		gap: 1.35rem;
	}

	.starter-rank {
		display: grid;
		gap: 1.25rem;
	}

	/* The preview sits on the matcha auth panel, so everything reads in the on-primary ink. */
	.rank-emblem {
		display: grid;
		place-items: center;
		width: 6.2rem;
		height: 6.2rem;
		border-radius: var(--radius-full);
		background: rgba(255, 248, 236, 0.18);
		box-shadow: inset 0 0 0 4px rgba(255, 248, 236, 0.35);
	}

	.rank-emblem span {
		color: var(--color-on-primary);
		font-family: var(--font-display);
		font-size: 2.6rem;
		font-weight: 900;
	}

	.caption {
		display: inline-block;
		margin: 0 0 0.6rem;
		padding: 6px 14px;
		border-radius: var(--radius-full);
		background: rgba(255, 248, 236, 0.2);
		color: var(--color-on-primary);
		font-size: var(--font-size-caption);
		font-weight: var(--font-weight-bold);
	}

	h1 {
		margin: 0 0 0.9rem;
		color: var(--color-on-primary);
		font-family: var(--font-display);
		font-size: var(--font-size-h1);
		font-weight: var(--font-weight-bold);
		line-height: var(--line-height-tight);
		letter-spacing: 0;
	}

	.intro {
		margin: 0;
		color: rgba(255, 248, 236, 0.92);
		font-size: var(--font-size-body);
		line-height: var(--line-height-relaxed);
	}
</style>
