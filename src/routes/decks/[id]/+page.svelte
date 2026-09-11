<script lang="ts">
	import { resolve } from '$app/paths'
	import { page } from '$app/state'

	type Card = {
		id: number
		front: string
		back: string
	}

	let title = $state(page.params.id === 'new' ? '' : 'Everyday Japanese')
	let cards = $state<Card[]>([
		{ id: 1, front: 'こんにちは', back: 'Hello' },
		{ id: 2, front: 'ありがとう', back: 'Thank you' },
	])
	let front = $state('')
	let back = $state('')
	let message = $state('')

	const isNewDeck = $derived(page.params.id === 'new')
	const canAddCard = $derived(front.trim().length > 0 && back.trim().length > 0)

	function saveDeck() {
		if (!title.trim()) return
		message = 'Deck title saved for this preview.'
	}

	function addCard() {
		if (!canAddCard) return

		cards = [...cards, { id: Date.now(), front: front.trim(), back: back.trim() }]
		front = ''
		back = ''
		message = 'Card added to this preview.'
	}

	function deleteCard(card: Card) {
		cards = cards.filter((item) => item.id !== card.id)
		message = 'Card removed from this preview.'
	}
</script>

<svelte:head>
	<title>{isNewDeck ? 'New deck' : `${title || 'Deck'} | TanTore`}</title>
</svelte:head>

<main class="deck-page">
	<section class="deck-shell" aria-labelledby="deck-title">
		<header class="site-header">
			<a class="brand-mark" href={resolve('/', {})} aria-label="TanTore home">
				<span class="brand-seal">単</span>
				<span>TanTore</span>
			</a>
			<a class="back-link" href={resolve('/', {})}>Back to library</a>
		</header>

		<div class="deck-content">
			<header class="page-heading">
				<div>
					<p class="caption">デッキ編集</p>
					<h1 id="deck-title">{isNewDeck ? 'Create a deck' : 'Edit deck'}</h1>
					<p class="intro">Build a small stack of cards, one clear idea at a time.</p>
				</div>
				<div class="card-count" aria-label={`${cards.length} cards`}>
					<strong>{String(cards.length).padStart(2, '0')}</strong>
					<span>cards</span>
				</div>
			</header>

			<form
				class="deck-form"
				onsubmit={(event) => {
					event.preventDefault()
					saveDeck()
				}}
			>
				<label for="deck-title-input">Deck name</label>
				<div class="title-row">
					<input id="deck-title-input" bind:value={title} placeholder="e.g. Everyday Japanese" />
					<button class="save-button" type="submit" disabled={!title.trim()}>Save deck</button>
				</div>
			</form>

			<div class="editor-grid">
				<section class="card-composer" aria-labelledby="add-card-title">
					<div class="section-heading">
						<div>
							<p class="caption">カード追加</p>
							<h2 id="add-card-title">Add a card</h2>
						</div>
						<span class="step-mark">01</span>
					</div>
					<div class="field-grid">
						<label for="front">Front <span>Japanese</span></label>
						<textarea id="front" bind:value={front} rows="4" placeholder="こんにちは"></textarea>
						<label for="back">Back <span>Meaning or note</span></label>
						<textarea id="back" bind:value={back} rows="4" placeholder="Hello"></textarea>
					</div>
					<button class="add-button" type="button" onclick={addCard} disabled={!canAddCard}
						>＋ Add card</button
					>
				</section>

				<section class="card-list" aria-labelledby="card-list-title">
					<div class="section-heading">
						<div>
							<p class="caption">カード一覧</p>
							<h2 id="card-list-title">Your cards</h2>
						</div>
						<span class="step-mark">02</span>
					</div>
					{#if cards.length === 0}
						<div class="empty-state">
							<span>◇</span>
							<p>Your first card is waiting.<br />Add a front and back to begin.</p>
						</div>
					{:else}
						<ul>
							{#each cards as card, index (card.id)}
								<li>
									<span class="index">{String(index + 1).padStart(2, '0')}</span>
									<div class="card-copy"><strong>{card.front}</strong><span>{card.back}</span></div>
									<button
										class="delete-button"
										type="button"
										aria-label={`Delete ${card.front}`}
										title="Delete card"
										onclick={() => deleteCard(card)}>×</button
									>
								</li>
							{/each}
						</ul>
					{/if}
				</section>
			</div>
			{#if message}<p class="status" role="status">{message}</p>{/if}
		</div>
	</section>
</main>

<style>
	:global(body) {
		margin: 0;
		background:
			linear-gradient(90deg, rgba(91, 74, 48, 0.035) 1px, transparent 1px),
			linear-gradient(rgba(91, 74, 48, 0.035) 1px, transparent 1px), #f6f0e3;
		background-size: 34px 34px;
		color: #29231c;
		font-family:
			ui-sans-serif,
			system-ui,
			-apple-system,
			BlinkMacSystemFont,
			'Segoe UI',
			sans-serif;
	}
	.deck-page {
		min-height: 100vh;
		padding: clamp(0.85rem, 3vw, 2rem);
	}
	.deck-shell {
		width: min(100%, 74rem);
		margin: 0 auto;
		overflow: hidden;
		border: 1px solid #d7c8ad;
		border-radius: 8px;
		background: #fffaf0;
		box-shadow: 0 18px 42px rgba(68, 47, 25, 0.12);
	}
	.site-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 1rem;
		padding: 0.9rem 1rem;
		border-bottom: 1px solid #e2d5bf;
	}
	.brand-mark {
		display: inline-flex;
		align-items: center;
		gap: 0.6rem;
		color: inherit;
		font-weight: 900;
		text-decoration: none;
	}
	.brand-seal {
		display: grid;
		place-items: center;
		width: 1.85rem;
		height: 1.85rem;
		border: 2px solid #b43b3b;
		border-radius: 999px;
		color: #b43b3b;
		background: #fffaf0;
		font-size: 0.82rem;
		font-weight: 900;
	}
	.back-link {
		color: #75654f;
		font-size: 0.86rem;
		font-weight: 800;
		text-decoration: none;
	}
	.back-link:hover {
		color: #9c3d4f;
	}
	.deck-content {
		padding: clamp(1.3rem, 4vw, 3rem);
		background: linear-gradient(rgba(198, 75, 107, 0.035) 1px, transparent 1px), #fffdf8;
		background-size: 100% 3.2rem;
	}
	.page-heading,
	.section-heading,
	.title-row {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 1rem;
	}
	.page-heading {
		align-items: flex-end;
		margin-bottom: 2rem;
	}
	.caption {
		margin: 0 0 0.45rem;
		color: #9c3d4f;
		font-size: 0.78rem;
		font-weight: 900;
	}
	h1,
	h2,
	p {
		margin-top: 0;
	}
	h1 {
		margin-bottom: 0.5rem;
		font-size: clamp(1.8rem, 4vw, 2.7rem);
		line-height: 1.05;
	}
	h2 {
		margin: 0;
		font-size: 1.35rem;
	}
	.intro {
		margin: 0;
		color: #75654f;
	}
	.card-count {
		display: grid;
		justify-items: end;
		color: #75654f;
	}
	.card-count strong {
		color: #b43b3b;
		font-size: 2rem;
		line-height: 1;
	}
	.card-count span {
		font-size: 0.72rem;
		font-weight: 900;
		text-transform: uppercase;
	}
	.deck-form,
	.card-composer,
	.card-list {
		border: 1px solid #e2d5bf;
		background: rgba(255, 250, 240, 0.75);
	}
	.deck-form {
		padding: 1rem;
		margin-bottom: 1.25rem;
	}
	label {
		display: flex;
		justify-content: space-between;
		gap: 1rem;
		margin-bottom: 0.45rem;
		color: #75654f;
		font-size: 0.78rem;
		font-weight: 900;
	}
	label span {
		color: #a89880;
		font-weight: 700;
	}
	.title-row {
		align-items: stretch;
	}
	input,
	textarea {
		width: 100%;
		box-sizing: border-box;
		border: 1px solid #cbbca3;
		border-radius: 4px;
		background: #fffdf8;
		color: #29231c;
		font: inherit;
		outline: none;
	}
	input {
		min-height: 3rem;
		padding: 0.7rem 0.85rem;
		font-size: 1.1rem;
		font-weight: 800;
	}
	textarea {
		min-height: 7rem;
		padding: 0.8rem;
		resize: vertical;
	}
	input:focus,
	textarea:focus {
		border-color: #2f6f63;
		box-shadow: 0 0 0 3px rgba(47, 111, 99, 0.12);
	}
	button {
		border-radius: 5px;
		font: inherit;
		font-weight: 900;
		cursor: pointer;
	}
	button:disabled {
		cursor: not-allowed;
		opacity: 0.5;
	}
	.save-button,
	.add-button {
		border: 1px solid #1d554b;
		background: #2f6f63;
		color: #fffaf0;
		box-shadow: 0 3px 0 #1d554b;
	}
	.save-button {
		min-width: 8rem;
		padding: 0 1rem;
	}
	.add-button {
		min-height: 2.8rem;
		padding: 0 1rem;
	}
	.save-button:hover:not(:disabled),
	.add-button:hover:not(:disabled) {
		background: #285f55;
	}
	.editor-grid {
		display: grid;
		grid-template-columns: minmax(0, 0.95fr) minmax(0, 1.05fr);
		gap: 1.25rem;
	}
	.card-composer,
	.card-list {
		padding: 1.25rem;
	}
	.section-heading {
		align-items: flex-start;
		margin-bottom: 1.25rem;
	}
	.step-mark {
		color: #b43b3b;
		font-size: 0.78rem;
		font-weight: 900;
	}
	.field-grid {
		display: grid;
		gap: 0.45rem;
		margin-bottom: 1rem;
	}
	.field-grid label:not(:first-child) {
		margin-top: 0.55rem;
	}
	.card-list ul {
		display: grid;
		gap: 0.65rem;
		padding: 0;
		margin: 0;
		list-style: none;
	}
	.card-list li {
		display: flex;
		align-items: center;
		gap: 0.8rem;
		min-height: 4.2rem;
		padding: 0.65rem 0.7rem;
		border: 1px solid #e2d5bf;
		background: #fffdf8;
	}
	.index {
		color: #b43b3b;
		font-size: 0.74rem;
		font-weight: 900;
	}
	.card-copy {
		display: grid;
		gap: 0.25rem;
		min-width: 0;
		flex: 1;
	}
	.card-copy strong,
	.card-copy span {
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
	.card-copy span {
		color: #75654f;
		font-size: 0.9rem;
	}
	.delete-button {
		width: 2rem;
		height: 2rem;
		border: 1px solid #d7c8ad;
		background: transparent;
		color: #9c3d4f;
		font-size: 1.3rem;
		line-height: 1;
	}
	.delete-button:hover {
		background: #f8e8e2;
	}
	.empty-state {
		display: grid;
		place-items: center;
		min-height: 14rem;
		border: 1px dashed #cbbca3;
		color: #75654f;
		text-align: center;
	}
	.empty-state span {
		color: #b43b3b;
		font-size: 2rem;
	}
	.empty-state p {
		margin: 0;
		line-height: 1.55;
	}
	.status {
		margin: 1rem 0 0;
		color: #2f6f63;
		font-size: 0.88rem;
		font-weight: 800;
	}
	@media (max-width: 700px) {
		.page-heading,
		.title-row {
			align-items: stretch;
			flex-direction: column;
		}
		.card-count {
			justify-items: start;
		}
		.save-button {
			min-height: 3rem;
		}
		.editor-grid {
			grid-template-columns: 1fr;
		}
	}
	@media (max-width: 420px) {
		.deck-page {
			padding: 0;
		}
		.deck-shell {
			min-height: 100vh;
			border: 0;
			border-radius: 0;
		}
		.site-header {
			align-items: flex-start;
			flex-direction: column;
		}
		.deck-content {
			padding: 1.25rem;
		}
	}
</style>
