<script lang="ts">
	import { page } from '$app/stores'
	import { resolveRoute } from '$app/paths'

	let isMenuOpen = $state(false)
</script>

<header class="navbar">
	<div class="nav-container">
		<a href={resolveRoute('/dashboard', {})} class="logo">
			<span class="logo-icon">🍡</span>
			<span class="logo-text">Takoyaki Cards</span>
		</a>

		<!-- Desktop Navigation with Dynamic Route Binds -->
		<nav class="nav-links desktop-nav">
			<a
				href={resolveRoute('/dashboard', {})}
				class:active={$page.url.pathname === '/dashboard' || $page.url.pathname === '/'}
			>
				Dashboard
			</a>
			<a
				href={resolveRoute('/deck_list', {})}
				class:active={$page.url.pathname.startsWith('/deck_list')}
			>
				Decks
			</a>
		</nav>

		<div class="nav-right">
			<div class="avatar">た</div>
			<button
				class="mobile-toggle"
				onclick={() => (isMenuOpen = !isMenuOpen)}
				aria-label="Toggle Menu"
			>
				{isMenuOpen ? '✕' : '☰'}
			</button>
		</div>
	</div>

	{#if isMenuOpen}
		<nav class="mobile-nav">
			<a
				href={resolveRoute('/dashboard', {})}
				class:active={$page.url.pathname === '/dashboard' || $page.url.pathname === '/'}
			>
				Dashboard
			</a>
			<a
				href={resolveRoute('/deck_list', {})}
				class:active={$page.url.pathname.startsWith('/deck_list')}
			>
				Decks
			</a>
		</nav>
	{/if}
</header>

<style>
	.navbar {
		background: var(--color-surface);
		border-bottom: 1px solid var(--color-border);
		position: sticky;
		top: 0;
		z-index: var(--z-sticky);
	}

	.nav-container {
		max-width: 1000px;
		margin: 0 auto;
		height: 64px;
		padding: 0 var(--spacing-lg);
		display: flex;
		align-items: center;
		justify-content: space-between;
	}

	.logo {
		display: flex;
		align-items: center;
		gap: var(--spacing-sm);
		font-weight: var(--font-weight-bold);
		font-size: var(--font-size-h3);
		text-decoration: none;
		color: var(--color-text);
	}

	.nav-links {
		display: flex;
		gap: var(--spacing-xl);
	}

	.nav-links a,
	.mobile-nav a {
		text-decoration: none;
		color: var(--color-text-secondary);
		font-weight: var(--font-weight-medium);
		font-size: var(--font-size-small);
		padding: var(--spacing-xs) 0;
		position: relative;
		transition: color var(--duration-fast) ease;
	}

	/* Active indicator styling */
	.nav-links a.active,
	.mobile-nav a.active {
		color: var(--color-primary);
		font-weight: var(--font-weight-bold);
	}

	.nav-links a.active::after {
		content: '';
		position: absolute;
		bottom: -18px;
		left: 0;
		right: 0;
		height: 3px;
		background-color: var(--color-primary);
		border-radius: var(--radius-full);
	}

	.nav-right {
		display: flex;
		align-items: center;
		gap: var(--spacing-md);
	}

	.avatar {
		width: 36px;
		height: 36px;
		border-radius: var(--radius-full);
		background: var(--rank-badge-background);
		border: 1px solid var(--color-border);
		display: flex;
		align-items: center;
		justify-content: center;
		font-weight: var(--font-weight-bold);
		color: var(--color-text);
	}

	.mobile-toggle {
		display: none;
		background: transparent;
		border: none;
		font-size: 20px;
		color: var(--color-text);
		cursor: pointer;
	}

	.mobile-nav {
		display: flex;
		flex-direction: column;
		padding: var(--spacing-md) var(--spacing-lg);
		background: var(--color-surface);
		border-top: 1px solid var(--color-border);
		gap: var(--spacing-md);
	}

	@media (max-width: 640px) {
		.desktop-nav {
			display: none;
		}
		.mobile-toggle {
			display: block;
		}
	}
</style>
