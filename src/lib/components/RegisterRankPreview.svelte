<script lang="ts">
	type Props = {
		titleId?: string
	}

	let { titleId }: Props = $props()
</script>

<div class="preview">
	<div class="starter-rank">
		<div class="rank-emblem" style:--rank-color="#b7ac86" aria-hidden="true">
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

	.rank-emblem {
		display: grid;
		place-items: center;
		width: 6.2rem;
		height: 6.2rem;
		border: 4px solid var(--rank-color);
		border-radius: 999px;
		background: #fffaf0;
		box-shadow:
			inset 0 0 0 5px #ffffff,
			0 8px 18px rgba(68, 47, 25, 0.14);
	}

	.rank-emblem span {
		color: var(--rank-color);
		font-size: 2.4rem;
		font-weight: 900;
	}

	.caption {
		margin: 0 0 0.45rem;
		color: #9c3d4f;
		font-size: 0.78rem;
		font-weight: 900;
	}

	h1 {
		margin: 0 0 0.85rem;
		color: #29231c;
		font-size: 2.45rem;
		line-height: 1.02;
		letter-spacing: 0;
	}

	.intro {
		margin: 0;
		color: #625746;
		font-size: 0.98rem;
		line-height: 1.7;
	}

	@media (max-width: 760px) {
		h1 {
			font-size: 2.05rem;
		}
	}
</style>
