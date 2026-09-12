<script lang="ts">
	import Card from '$lib/components/card.svelte'
	import Button from '$lib/components/button.svelte'
	import RankStatusCard from '$lib/components/rank_status_card.svelte'
	import Navbar from '$lib/components/navbar.svelte'
	import { MOCK_DECKS } from '$lib/mock-data/decks'

	const mockStreak = 80
	const mockPoints = 1250

	let searchQuery = $state('')
	let sortBy = $state<'recent' | 'cards'>('recent')

	// Reactive deck filtering & sorting
	let filteredDecks = $derived(
		MOCK_DECKS.filter((deck) => deck.title.toLowerCase().includes(searchQuery.toLowerCase())).sort(
			(a, b) => {
				if (sortBy === 'cards') return b.cardCount - a.cardCount
				return 0 // Default to initial order
			},
		),
	)

	function handleStudy(deckId: string, event: MouseEvent) {
		event.stopPropagation()
		// Trigger study route navigation or modal
		console.log('Studying deck:', deckId)
	}
</script>

<svelte:head>
	<title>Dashboard</title>
</svelte:head>

<Navbar />

<main class="dashboard">
	<RankStatusCard streak={mockStreak} points={mockPoints} />

	<section class="decks-section">
		<div class="decks-header">
			<div>
				<h2>Your decks</h2>
				<p class="decks-subtitle">{filteredDecks.length} active decks</p>
			</div>
			<Button variant="primary">+ Create new</Button>
		</div>

		<!-- Controls Bar -->
		<div class="deck-controls">
			<input
				type="search"
				placeholder="Search decks..."
				bind:value={searchQuery}
				class="search-input"
			/>

			<select bind:value={sortBy} class="sort-select">
				<option value="recent">Recently Studied</option>
				<option value="cards">Card Count</option>
			</select>
		</div>

		<!-- Grid View -->
		<div class="deck-grid">
			{#each filteredDecks as deck (deck.id)}
				<div class="deck-card-wrapper">
					<Card interactive>
						<div class="deck-card-inner">
							<div class="deck-card-top">
								<h3 class="deck-title">{deck.title}</h3>
								<button class="icon-button" aria-label="Deck options">⋮</button>
							</div>

							<!-- Deck Mastery Progress Bar -->
							<div class="progress-container">
								<div class="progress-bar" style="width: 65%;"></div>
							</div>

							<div class="deck-card-footer">
								<span class="deck-meta">{deck.cardCount} cards</span>
								<button class="study-btn" onclick={(e) => handleStudy(deck.id, e)}> Study </button>
							</div>
						</div>
					</Card>
				</div>
			{/each}

			<button class="new-deck-tile" aria-label="Create new deck">
				<span class="plus-icon">+</span>
				<span>New deck</span>
			</button>
		</div>
	</section>
</main>

<style>
	.dashboard {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-xl);
		padding: var(--spacing-xl) var(--spacing-2xl);
		max-width: 1000px;
		margin: 0 auto;
	}

	.decks-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: var(--spacing-md);
	}

	.decks-header h2 {
		margin: 0;
		font-size: var(--font-size-h2);
		font-weight: var(--font-weight-bold);
	}

	.decks-subtitle {
		margin: var(--spacing-xs) 0 0 0;
		color: var(--color-text-secondary);
		font-size: var(--font-size-small);
	}

	.deck-controls {
		display: flex;
		gap: var(--spacing-md);
		margin-bottom: var(--spacing-lg);
	}

	.search-input,
	.sort-select {
		padding: var(--spacing-sm) var(--spacing-md);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
		font-family: var(--font-family);
		font-size: var(--font-size-small);
		background: var(--color-surface);
		color: var(--color-text);
	}

	.search-input {
		flex: 1;
	}

	.deck-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
		gap: var(--spacing-lg);
	}

	.deck-card-wrapper {
		display: flex;
		flex-direction: column;
	}

	.deck-card-inner {
		display: flex;
		flex-direction: column;
		height: 100%;
		justify-content: space-between;
		gap: var(--spacing-md);
	}

	.deck-card-top {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
	}

	.deck-title {
		margin: 0;
		font-size: var(--font-size-body);
		font-weight: var(--font-weight-semibold);
	}

	.icon-button {
		background: transparent;
		border: none;
		color: var(--color-text-secondary);
		cursor: pointer;
		padding: 0 var(--spacing-xs);
		font-size: var(--font-size-h3);
	}

	.progress-container {
		height: 4px;
		width: 100%;
		background: var(--color-disabled-bg);
		border-radius: var(--radius-full);
		overflow: hidden;
	}

	.progress-bar {
		height: 100%;
		background: var(--color-success);
	}

	.deck-card-footer {
		display: flex;
		align-items: center;
		justify-content: space-between;
	}

	.deck-meta {
		color: var(--color-text-secondary);
		font-size: var(--font-size-small);
	}

	.study-btn {
		background: var(--color-primary-hover);
		color: var(--color-surface);
		border: none;
		padding: var(--spacing-xs) var(--spacing-md);
		border-radius: var(--radius-sm);
		font-weight: var(--font-weight-medium);
		font-size: var(--font-size-small);
		cursor: pointer;
	}

	.study-btn:hover {
		background: var(--color-primary-active);
	}

	.new-deck-tile {
		min-height: 140px;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: var(--spacing-xs);
		background: transparent;
		border: 2px dashed var(--color-border);
		border-radius: var(--radius-lg);
		color: var(--color-text-secondary);
		font-weight: var(--font-weight-semibold);
		cursor: pointer;
		transition: all var(--duration-fast) var(--ease-standard);
	}

	.new-deck-tile:hover {
		border-color: var(--color-primary);
		color: var(--color-primary);
		background: var(--color-surface);
	}
</style>
