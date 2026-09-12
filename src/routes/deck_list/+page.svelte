<script lang="ts">
	import Button from '$lib/components/button.svelte'
	import Navbar from '$lib/components/navbar.svelte'
	import { MOCK_DECKS } from '$lib/mock-data/decks'

	let searchQuery = $state('')

	let filteredDecks = $derived(
		MOCK_DECKS.filter((deck) => deck.title.toLowerCase().includes(searchQuery.toLowerCase())),
	)
</script>

<svelte:head>
	<title>Manage Decks - Takoyaki Cards</title>
</svelte:head>

<Navbar />

<main class="page-container">
	<div class="page-header">
		<div>
			<h1>Deck Management</h1>
			<p class="subtitle">Organize, edit, or create new vocabulary decks.</p>
		</div>
		<Button variant="primary">+ Create Deck</Button>
	</div>

	<div class="table-container">
		<div class="table-actions">
			<input
				type="search"
				placeholder="Search decks..."
				bind:value={searchQuery}
				class="search-input"
			/>
		</div>

		<table class="deck-table">
			<thead>
				<tr>
					<th>Deck Title</th>
					<th>Cards</th>
					<th>Status</th>
					<th class="text-right">Actions</th>
				</tr>
			</thead>
			<tbody>
				{#each filteredDecks as deck (deck.id)}
					<tr>
						<td class="font-semibold">{deck.title}</td>
						<td class="text-muted">{deck.cardCount} cards</td>
						<td>
							<span class="status-pill">Active</span>
						</td>
						<td class="actions-cell text-right">
							<button class="link-btn">Edit</button>
							<button class="link-btn danger">Delete</button>
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
</main>

<style>
	.page-container {
		max-width: 1000px;
		margin: 0 auto;
		padding: var(--spacing-xl) var(--spacing-2xl);
	}

	.page-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: var(--spacing-xl);
	}

	.page-header h1 {
		margin: 0;
		font-size: var(--font-size-h1);
		color: var(--color-text);
	}

	.subtitle {
		margin: var(--spacing-xs) 0 0 0;
		color: var(--color-text-secondary);
	}

	.table-container {
		background: var(--color-surface);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-lg);
		box-shadow: var(--shadow-sm);
		overflow: hidden;
	}

	.table-actions {
		padding: var(--spacing-md);
		border-bottom: 1px solid var(--color-border);
	}

	.search-input {
		width: 100%;
		max-width: 300px;
		padding: var(--spacing-sm) var(--spacing-md);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
		font-family: var(--font-family);
		font-size: var(--font-size-small);
	}

	.deck-table {
		width: 100%;
		border-collapse: collapse;
		text-align: left;
		font-size: var(--font-size-small);
	}

	.deck-table th {
		background: var(--color-background);
		padding: var(--spacing-md);
		color: var(--color-text-secondary);
		font-weight: var(--font-weight-semibold);
		border-bottom: 1px solid var(--color-border);
	}

	.deck-table td {
		padding: var(--spacing-md);
		border-bottom: 1px solid var(--color-border);
		color: var(--color-text);
	}

	.deck-table tr:last-child td {
		border-bottom: none;
	}

	.font-semibold {
		font-weight: var(--font-weight-semibold);
	}

	.text-muted {
		color: var(--color-text-secondary);
	}

	.text-right {
		text-align: right;
	}

	.status-pill {
		display: inline-block;
		padding: 2px var(--spacing-sm);
		background: var(--color-success);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-full);
		font-size: var(--font-size-caption);
		color: var(--color-surface);
	}

	.actions-cell {
		display: flex;
		justify-content: flex-end;
		gap: var(--spacing-md);
	}

	.link-btn {
		background: none;
		border: none;
		color: var(--color-primary);
		font-weight: var(--font-weight-medium);
		cursor: pointer;
		padding: 0;
	}

	.link-btn.danger {
		color: var(--color-error);
	}

	.link-btn:hover {
		text-decoration: underline;
	}
</style>
