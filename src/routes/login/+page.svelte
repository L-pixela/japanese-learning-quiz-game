<script lang="ts">
	import { goto } from '$app/navigation'
	import { resolve } from '$app/paths'
	import RegisterTextField from '$lib/components/RegisterTextField.svelte'

	let username = $state('')
	let password = $state('')
	let submitted = $state(false)
	let serverError = $state('')
	let isSubmitting = $state(false)

	const usernameError = $derived(
		submitted && username.trim().length === 0
			? 'Enter your username.'
			: submitted && username.trim().length < 3
				? 'Username needs at least 3 characters.'
				: '',
	)
	const passwordError = $derived(
		submitted && password.length === 0
			? 'Enter your password.'
			: submitted && password.length < 8
				? 'Password needs at least 8 characters.'
				: '',
	)
	const isValid = $derived(!usernameError && !passwordError)

	async function handleSubmit(event: SubmitEvent) {
		event.preventDefault()
		submitted = true
		serverError = ''

		if (!isValid || isSubmitting) return

		isSubmitting = true

		try {
			const response = await fetch('/api/login', {
				method: 'POST',
				headers: { 'content-type': 'application/json' },
				body: JSON.stringify({ username: username.trim(), password }),
			})

			if (!response.ok) {
				const data = (await response.json()) as { error?: string }
				serverError =
					data.error === 'invalid credentials'
						? 'Username or password is incorrect.'
						: 'Unable to log in right now.'
				return
			}

			await goto(resolve('/', {}))
		} catch {
			serverError = 'Unable to connect. Please try again.'
		} finally {
			isSubmitting = false
		}
	}
</script>

<main class="login-page">
	<section class="login-shell" aria-labelledby="login-title">
		<header class="site-header">
			<a class="brand-mark" href={resolve('/', {})} aria-label="TanTore home">
				<span class="brand-seal">単</span>
				<span>TanTore</span>
			</a>
			<p>単語トレーニング / Word training</p>
		</header>

		<div class="login-layout">
			<aside class="rank-panel" aria-label="TanTore rank preview">
				<div class="preview">
					<div class="starter-rank">
						<div class="rank-emblem" aria-hidden="true">
							<span>米</span>
						</div>
						<div>
							<p class="caption">今日の練習</p>
							<h1 id="login-title">Welcome back to practice</h1>
							<p class="intro">
								Keep your streak going, review your vocabulary, and grow your food rank one session
								at a time.
							</p>
						</div>
					</div>
				</div>
			</aside>

			<form class="login-form" onsubmit={handleSubmit} novalidate>
				<div class="form-title">
					<p class="caption">ログイン</p>
					<h2>Log in <span class="japanese-label">ログイン</span></h2>
				</div>

				<RegisterTextField
					id="username"
					bind:value={username}
					label="Username / ユーザー名"
					name="username"
					autocomplete="username"
					error={usernameError}
				/>

				<RegisterTextField
					id="password"
					bind:value={password}
					label="Password / パスワード"
					name="password"
					type="password"
					autocomplete="current-password"
					error={passwordError}
					showPasswordToggle
				/>

				{#if serverError}
					<p class="server-error" role="alert">{serverError}</p>
				{/if}

				<button type="submit" disabled={isSubmitting}>
					{isSubmitting ? 'Logging in... / ログイン中...' : 'Log in / ログイン'}
				</button>

				<p class="register-link">
					New to TanTore? / 初めてですか？ <a href={resolve('/register', {})}
						>Create an account / アカウントを作成</a
					>
				</p>
			</form>
		</div>
	</section>
</main>

<style>
	.login-page {
		min-height: 100vh;
		display: grid;
		place-items: center;
		padding: 1.5rem;
	}

	.login-shell {
		width: min(100%, 58rem);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-lg);
		background: var(--color-surface);
		box-shadow: var(--shadow-lg);
	}

	.site-header p {
		margin: 0;
		color: var(--color-text-secondary);
		font-size: 0.86rem;
		font-weight: 800;
	}

	.login-layout {
		display: grid;
		grid-template-columns: minmax(17rem, 0.78fr) minmax(20rem, 1fr);
		min-height: 34rem;
	}

	.rank-panel {
		position: relative;
		display: flex;
		flex-direction: column;
		gap: 1.35rem;
		border-right: 1px solid var(--color-border-subtle);
		padding: 2rem;
		background:
			linear-gradient(135deg, rgba(198, 75, 107, 0.06), transparent 42%),
			repeating-linear-gradient(
				-45deg,
				rgba(183, 172, 134, 0.16) 0,
				rgba(183, 172, 134, 0.16) 1px,
				transparent 1px,
				transparent 11px
			),
			var(--rank-badge-background);
	}

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
		border: 4px solid #b7ac86;
		border-radius: 999px;
		background: #fffaf0;
		box-shadow:
			inset 0 0 0 5px #ffffff,
			0 8px 18px rgba(68, 47, 25, 0.14);
	}

	.rank-emblem span {
		color: #b7ac86;
		font-size: 2.4rem;
		font-weight: 900;
	}

	.intro {
		margin: 0;
		color: #625746;
		font-size: 0.98rem;
		line-height: 1.7;
	}

	.login-form {
		display: flex;
		flex-direction: column;
		justify-content: center;
		gap: 1rem;
		padding: clamp(1.5rem, 4vw, 3rem);
		background:
			linear-gradient(var(--color-paper-line) 1px, transparent 1px), var(--color-surface-raised);
		background-size: 100% 3.2rem;
	}

	.form-title {
		margin-bottom: 0.35rem;
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
		margin-bottom: 0.85rem;
		color: var(--color-text);
		font-size: 2.45rem;
		line-height: 1.02;
	}

	h2 {
		margin-bottom: 0;
		font-size: 1.85rem;
		line-height: 1.1;
	}

	button {
		min-height: 3.1rem;
		border: 1px solid var(--color-primary-active);
		border-radius: 6px;
		background: var(--color-primary);
		color: var(--color-surface);
		font: inherit;
		font-weight: 900;
		cursor: pointer;
		box-shadow: 0 4px 0 var(--color-primary-active);
		transition:
			transform 120ms ease,
			box-shadow 120ms ease,
			background 120ms ease;
	}

	button:hover:not(:disabled) {
		background: var(--color-primary-hover);
		transform: translateY(1px);
		box-shadow: 0 3px 0 var(--color-primary-active);
	}

	button:active:not(:disabled) {
		transform: translateY(4px);
		box-shadow: 0 0 0 var(--color-primary-active);
	}

	button:disabled {
		cursor: wait;
		opacity: 0.7;
	}

	.server-error {
		margin: 0;
		color: var(--color-error);
		font-weight: 800;
	}

	.register-link {
		margin: 0;
		color: var(--color-text-secondary);
		font-weight: 750;
		text-align: center;
	}

	.register-link a {
		color: var(--color-accent);
		font-weight: 900;
		text-decoration: none;
	}

	.register-link a:hover {
		text-decoration: underline;
	}

	@media (max-width: 760px) {
		.login-page {
			padding: 0.85rem;
			place-items: start center;
		}

		.login-layout {
			grid-template-columns: 1fr;
		}

		.rank-panel {
			border-right: 0;
			border-bottom: 1px solid var(--color-border-subtle);
			padding: 1.35rem;
		}

		h1 {
			font-size: 2.05rem;
		}
	}

	@media (max-width: 420px) {
		.login-page {
			padding: 0;
		}

		.login-shell {
			min-height: 100vh;
			border: 0;
			border-radius: 0;
		}

		.site-header {
			align-items: flex-start;
			flex-direction: column;
		}
	}
</style>
