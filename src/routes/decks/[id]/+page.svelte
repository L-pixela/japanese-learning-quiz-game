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
	let editingCardId = $state<number | null>(null)
	let editingFront = $state('')
	let editingBack = $state('')

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

	function startEditing(card: Card) {
		editingCardId = card.id
		editingFront = card.front
		editingBack = card.back
		message = ''
	}

	function cancelEditing() {
		editingCardId = null
		editingFront = ''
		editingBack = ''
	}

	function saveCard(card: Card) {
		if (!editingFront.trim() || !editingBack.trim()) return

		cards = cards.map((item) =>
			item.id === card.id
				? { ...item, front: editingFront.trim(), back: editingBack.trim() }
				: item,
		)
		cancelEditing()
		message = 'Card updated for this preview.'
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
			<a class="back-link" href={resolve('/', {})}>Back to library / ライブラリへ</a>
		</header>

		<div class="deck-content">
			<header class="page-heading">
				<div>
					<p class="caption">デッキ編集</p>
					<h1 id="deck-title">
						{isNewDeck ? 'Create a deck' : 'Edit deck'}
						<span class="japanese-label">{isNewDeck ? 'デッキを作成' : 'デッキを編集'}</span>
					</h1>
					<p class="intro">
						Build a small stack of cards, one clear idea at a time. /
						一つずつ覚えやすいカードを作りましょう。
					</p>
				</div>
				<div class="card-count" aria-label={`${cards.length} cards`}>
					<strong>{String(cards.length).padStart(2, '0')}</strong>
					<span>cards / 枚</span>
				</div>
			</header>

			<form
				class="deck-form"
				onsubmit={(event) => {
					event.preventDefault()
					saveDeck()
				}}
			>
				<label for="deck-title-input">Deck name / デッキ名</label>
				<div class="title-row">
					<input id="deck-title-input" bind:value={title} placeholder="e.g. Everyday Japanese" />
					<button class="save-button" type="submit" disabled={!title.trim()}>Save / 保存</button>
				</div>
			</form>

			<div class="editor-grid">
				<section class="card-composer" aria-labelledby="add-card-title">
					<div class="section-heading">
						<div>
							<p class="caption">カード追加</p>
							<h2 id="add-card-title">
								Add a card <span class="japanese-label">カードを追加</span>
							</h2>
						</div>
						<span class="step-mark">01</span>
					</div>
					<div class="field-grid">
						<label for="front">Front / フロント</label>
						<input type="text" id="front" bind:value={front} />
						<label for="back">Back / バック</label>
						<input type="text" id="back" bind:value={back} />
					</div>
					<button class="add-button" type="button" onclick={addCard} disabled={!canAddCard}>
						+ Add card / カードを追加</button
					>
				</section>

				<section class="card-list" aria-labelledby="card-list-title">
					<div class="section-heading">
						<div>
							<p class="caption">カード一覧</p>
							<h2 id="card-list-title">
								Your cards <span class="japanese-label">カード一覧</span>
							</h2>
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
									{#if editingCardId === card.id}
										<div class="card-edit-fields">
											<input aria-label="Card front" bind:value={editingFront} />
											<input aria-label="Card back" bind:value={editingBack} />
										</div>
										<div class="card-actions">
											<button
												class="edit-save-button"
												type="button"
												disabled={!editingFront.trim() || !editingBack.trim()}
												onclick={() => saveCard(card)}>Save</button
											>
											<button class="cancel-button" type="button" onclick={cancelEditing}
												>Cancel</button
											>
										</div>
									{:else}
										<div class="card-copy">
											<strong>{card.front}</strong><span>{card.back}</span>
										</div>
										<div class="card-actions">
											<button
												class="edit-button"
												type="button"
												aria-label={`Edit ${card.front}`}
												title="Edit card"
												onclick={() => startEditing(card)}>Edit</button
											>
											<button
												class="delete-button"
												type="button"
												aria-label={`Delete ${card.front}`}
												title="Delete card"
												onclick={() => deleteCard(card)}>×</button
											>
										</div>
									{/if}
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
	.deck-page {
		min-height: 100vh;
		padding: clamp(0.85rem, 3vw, 2rem);
	}
	.deck-shell {
		width: min(100%, 74rem);
		margin: 0 auto;
		overflow: hidden;
		border: 1px solid var(--color-border);
		border-radius: var(--radius-lg);
		background: var(--color-surface);
		box-shadow: var(--shadow-lg);
	}
	.back-link {
		color: var(--color-text-secondary);
		font-size: 0.86rem;
		font-weight: 800;
		text-decoration: none;
	}
	.back-link:hover {
		color: var(--color-accent);
	}
	.deck-content {
		padding: clamp(1.3rem, 4vw, 3rem);
		background:
			linear-gradient(var(--color-paper-line) 1px, transparent 1px), var(--color-surface-raised);
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
		color: var(--color-accent);
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
		color: var(--color-text-secondary);
	}
	.card-count {
		display: grid;
		justify-items: end;
		color: var(--color-text-secondary);
	}
	.card-count strong {
		color: var(--color-accent-strong);
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
		border: 1px solid var(--color-border-subtle);
		background: color-mix(in srgb, var(--color-surface) 75%, transparent);
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
		color: var(--color-text-secondary);
		font-size: 0.78rem;
		font-weight: 900;
	}
	.title-row {
		align-items: stretch;
	}
	input {
		width: 100%;
		box-sizing: border-box;
		border: 1px solid var(--color-input-border);
		border-radius: var(--radius-sm);
		background: var(--color-surface-raised);
		color: var(--color-text);
		font: inherit;
		outline: none;
	}
	input {
		min-height: 3rem;
		padding: 0.7rem 0.85rem;
		font-size: 1.1rem;
		font-weight: 800;
	}
	input:focus {
		border-color: var(--color-primary);
		box-shadow: 0 0 0 3px color-mix(in srgb, var(--color-focus-ring) 12%, transparent);
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
		border: 1px solid var(--color-primary-active);
		background: var(--color-primary);
		color: var(--color-surface);
		box-shadow: 0 3px 0 var(--color-primary-active);
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
		background: var(--color-primary-hover);
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
		color: var(--color-accent-strong);
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
		border: 1px solid var(--color-border-subtle);
		background: var(--color-surface-raised);
	}
	.index {
		color: var(--color-accent-strong);
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
		color: var(--color-text-secondary);
		font-size: 0.9rem;
	}
	.card-actions {
		display: flex;
		flex-shrink: 0;
		align-items: center;
		gap: 0.4rem;
	}
	.card-edit-fields {
		display: grid;
		flex: 1;
		gap: 0.4rem;
		min-width: 0;
	}
	.card-edit-fields input {
		min-height: 2.25rem;
		padding: 0.45rem 0.6rem;
		font-size: 0.9rem;
		font-weight: 700;
	}
	.edit-button,
	.edit-save-button,
	.cancel-button {
		min-height: 2rem;
		padding: 0 0.6rem;
		border: 1px solid var(--color-border);
		background: transparent;
		color: var(--color-text-secondary);
		font-size: 0.76rem;
	}
	.edit-button:hover,
	.edit-save-button:hover:not(:disabled) {
		border-color: var(--color-primary);
		color: var(--color-primary);
	}
	.cancel-button:hover {
		background: #f8e8e2;
		color: var(--color-accent);
	}
	.delete-button {
		width: 2rem;
		height: 2rem;
		border: 1px solid var(--color-border);
		background: transparent;
		color: var(--color-accent);
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
		border: 1px dashed var(--color-input-border);
		color: var(--color-text-secondary);
		text-align: center;
	}
	.empty-state span {
		color: var(--color-accent-strong);
		font-size: 2rem;
	}
	.empty-state p {
		margin: 0;
		line-height: 1.55;
	}
	.status {
		margin: 1rem 0 0;
		color: var(--color-primary);
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
		.card-list li {
			align-items: flex-start;
		}
		.card-actions {
			align-self: center;
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
