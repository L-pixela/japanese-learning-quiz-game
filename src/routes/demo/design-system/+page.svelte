<script lang="ts">
	import Button from '$lib/components/button.svelte'
	import Card from '$lib/components/card.svelte'
	import Input from '$lib/components/input.svelte'
	import Badge from '$lib/components/badge.svelte'
	import { RANKS } from '$lib/components/ranks'
	import Rank_Badge from '$lib/components/rank_badge.svelte'

	const colors = [
		{ name: 'Background', variable: '--color-background' },
		{ name: 'Surface', variable: '--color-surface' },
		{ name: 'Text', variable: '--color-text' },
		{ name: 'Text Secondary', variable: '--color-text-secondary' },
		{ name: 'Border', variable: '--color-border' },
		{ name: 'Primary', variable: '--color-primary' },
		{ name: 'Primary Hover', variable: '--color-primary-hover' },
		{ name: 'Primary Active', variable: '--color-primary-active' },
		{ name: 'Success', variable: '--color-success' },
		{ name: 'Error', variable: '--color-error' },
		{ name: 'Warning', variable: '--color-warning' },
		{ name: 'Disabled BG', variable: '--color-disabled-bg' },
		{ name: 'Focus Ring', variable: '--color-focus-ring' },
	]
	const typography = [
		{ name: 'Heading 1', variable: '--font-size-h1' },
		{ name: 'Heading 2', variable: '--font-size-h2' },
		{ name: 'Heading 3', variable: '--font-size-h3' },
		{ name: 'Body', variable: '--font-size-body' },
		{ name: 'Small', variable: '--font-size-small' },
		{ name: 'Caption', variable: '--font-size-caption' },
	]

	const spacing = [
		{ name: 'XS', variable: '--spacing-xs' },
		{ name: 'SM', variable: '--spacing-sm' },
		{ name: 'MD', variable: '--spacing-md' },
		{ name: 'LG', variable: '--spacing-lg' },
		{ name: 'XL', variable: '--spacing-xl' },
		{ name: '2XL', variable: '--spacing-2xl' },
	]

	const radii = [
		{ name: 'Small', variable: '--radius-sm' },
		{ name: 'Medium', variable: '--radius-md' },
		{ name: 'Large', variable: '--radius-lg' },
		{ name: 'Full', variable: '--radius-full' },
	]
</script>

<svelte:head>
	<title>Design System</title>
</svelte:head>

<div class="page">
	<header>
		<h1>Design System</h1>
		<p>Japanese Learning Quiz Game</p>
	</header>

	<!-- Global UI Colors -->
	<section>
		<h2>Global UI Colors</h2>

		<div class="color-grid">
			{#each colors as color (color.variable)}
				<div class="color-card">
					<div class="color-preview" style={`background-color: var(${color.variable})`}></div>

					<div class="color-info">
						<strong>{color.name}</strong>
						<code>{color.variable}</code>
					</div>
				</div>
			{/each}
		</div>
	</section>

	<!-- Rank Badges -->
	<section>
		<h2>Rank Badges</h2>
		<div class="component-demo">
			{#each RANKS as rank (rank.id)}
				<Rank_Badge {rank} size="md" showLabel />
			{/each}
		</div>
	</section>

	<!-- Typography -->
	<section>
		<h2>Typography</h2>

		<div class="typography">
			{#each typography as item (item.variable)}
				<div class="type-item">
					<code>{item.variable}</code>

					<p style={`font-size: var(${item.variable})`}>
						{item.name} — 日本語クイズゲーム
					</p>
				</div>
			{/each}
		</div>
	</section>

	<!-- Buttons -->
	<section>
		<h2>Buttons</h2>

		<div class="component-demo">
			<Button variant="primary">Primary</Button>
			<Button variant="secondary">Secondary</Button>
			<Button variant="success">Success</Button>
			<Button variant="error">Error</Button>
		</div>

		<h3>Sizes</h3>

		<div class="component-demo">
			<Button size="sm">Small</Button>
			<Button size="md">Medium</Button>
			<Button size="lg">Large</Button>
		</div>

		<h3>Disabled</h3>

		<div class="component-demo">
			<Button disabled>Disabled</Button>
		</div>
	</section>

	<!-- Badges -->
	<section>
		<h2>Badges</h2>
		<div class="component-demo">
			<Badge variant="primary">Primary</Badge>
			<Badge variant="success">Success</Badge>
			<Badge variant="error">Error</Badge>
			<Badge variant="warning">Streak at risk</Badge>
		</div>
	</section>

	<!-- Cards -->
	<section>
		<h2>Cards</h2>

		<div class="card-demo">
			<Card title="Static Card">
				<p>Non-clickable, default shadow.</p>
			</Card>
			<Card title="Interactive Card" interactive>
				<p>Hover me — lifts on hover.</p>
			</Card>
		</div>
	</section>

	<!-- Input Fields -->
	<section>
		<h2>Input Fields</h2>

		<div class="input-demo">
			<Input id="username-input" label="Username" placeholder="Enter your username" />

			<Input id="email-input" label="Email" type="email" placeholder="Enter your email" />

			<Input id="disabled-input" label="Disabled" placeholder="Disabled input" disabled />
		</div>
	</section>

	<!-- Spacing -->
	<section>
		<h2>Spacing</h2>

		<div class="spacing-list">
			{#each spacing as item (item.variable)}
				<div class="spacing-item">
					<span>{item.name}</span>

					<div
						class="spacing-box"
						style={`width: var(${item.variable}); height: var(${item.variable})`}
					></div>

					<code>{item.variable}</code>
				</div>
			{/each}
		</div>
	</section>

	<!-- Border Radius -->
	<section>
		<h2>Border Radius</h2>

		<div class="radius-grid">
			{#each radii as item (item.variable)}
				<div class="radius-box" style={`border-radius: var(${item.variable})`}>
					<strong>{item.name}</strong>
					<code>{item.variable}</code>
				</div>
			{/each}
		</div>
	</section>

	<!-- Shadows -->
	<section>
		<h2>Elevation</h2>
		<div class="component-demo">
			{#each [{ name: 'Small', var: '--shadow-sm' }, { name: 'Medium', var: '--shadow-md' }, { name: 'Large', var: '--shadow-lg' }] as s (s.var)}
				<div class="shadow-box" style={`box-shadow: var(${s.var})`}>
					<strong>{s.name}</strong>
				</div>
			{/each}
		</div>
	</section>
</div>

<style>
	.page {
		min-height: 100vh;
		padding: var(--spacing-2xl);
		background: var(--color-background);
		color: var(--color-text);
		font-family: var(--font-family);
	}

	header {
		margin-bottom: var(--spacing-2xl);
	}

	header h1 {
		margin: 0;
		font-size: var(--font-size-h1);
		font-weight: var(--font-weight-bold);
	}

	header p {
		margin-top: var(--spacing-sm);
		color: var(--color-text-secondary);
	}

	section {
		margin-bottom: var(--spacing-2xl);
	}

	h2 {
		margin-bottom: var(--spacing-lg);
		font-size: var(--font-size-h2);
	}

	h3 {
		margin-top: var(--spacing-lg);
		margin-bottom: var(--spacing-sm);
		font-size: var(--font-size-h3);
	}

	code {
		font-size: var(--font-size-caption);
		color: var(--color-text-secondary);
	}

	/* Global Colors */

	.color-grid {
		display: grid;
		grid-template-columns: repeat(4, 1fr);
		gap: var(--spacing-md);
	}

	.color-card {
		overflow: hidden;
		background: var(--color-surface);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
	}

	.color-preview {
		height: 100px;
	}

	.color-info {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-xs);
		padding: var(--spacing-md);
	}

	/* Typography */

	.typography {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-md);
	}

	.type-item {
		padding: var(--spacing-md);
		background: var(--color-surface);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
	}

	.type-item p {
		margin: var(--spacing-sm) 0 0;
	}

	/* Components */

	.component-demo {
		display: flex;
		flex-wrap: wrap;
		gap: var(--spacing-md);
	}

	.card-demo {
		display: flex;
		gap: var(--spacing-md);
		max-width: 400px;
	}

	.input-demo {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-md);
		max-width: 400px;
	}

	/* Spacing */

	.spacing-list {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-md);
	}

	.spacing-item {
		display: flex;
		align-items: center;
		gap: var(--spacing-md);
	}

	.spacing-box {
		min-width: 4px;
		min-height: 4px;
		background: var(--color-primary);
	}

	/* Border Radius */

	.radius-grid {
		display: grid;
		grid-template-columns: repeat(4, 1fr);
		gap: var(--spacing-md);
	}

	.radius-box {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		min-height: 120px;
		padding: var(--spacing-md);
		background: var(--color-surface);
		border: 1px solid var(--color-border);
		text-align: center;
	}

	@media (max-width: 800px) {
		.color-grid,
		.radius-grid {
			grid-template-columns: repeat(2, 1fr);
		}
	}
	.shadow-box {
		width: 140px;
		height: 100px;
		display: flex;
		align-items: center;
		justify-content: center;
		background: var(--color-surface);
		border-radius: var(--radius-md);
	}
</style>
