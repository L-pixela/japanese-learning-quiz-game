<script lang="ts">
	import { goto } from '$app/navigation'
	import { resolve } from '$app/paths'
	import RegisterRankPreview from '$lib/components/RegisterRankPreview.svelte'
	import RegisterTextField from '$lib/components/RegisterTextField.svelte'

	let username = $state('')
	let password = $state('')
	let confirmPassword = $state('')
	let submitted = $state(false)

	const usernameError = $derived(
		submitted && username.trim().length === 0
			? 'Choose a username.'
			: submitted && username.trim().length < 3
				? 'Username needs at least 3 characters.'
				: '',
	)
	const passwordError = $derived(
		submitted && password.length === 0
			? 'Create a password.'
			: submitted && password.length < 8
				? 'Password needs at least 8 characters.'
				: '',
	)
	const confirmPasswordError = $derived(
		submitted && confirmPassword.length === 0
			? 'Confirm your password.'
			: submitted && password !== confirmPassword
				? 'Passwords do not match.'
				: '',
	)
	const isValid = $derived(submitted && !usernameError && !passwordError && !confirmPasswordError)

	function handleSubmit(event: SubmitEvent) {
		event.preventDefault()
		submitted = true

		if (isValid) {
			goto(resolve('/', {}))
		}
	}
</script>

<main class="register-page">
	<section class="register-shell" aria-labelledby="register-title">
		<header class="site-header">
			<a class="brand-mark" href={resolve('/', {})} aria-label="TanTore home">
				<span class="brand-seal">単</span>
				<span>TanTore</span>
			</a>
			<p>単語トレーニング / Word training</p>
		</header>

		<div class="register-layout">
			<aside class="rank-panel" aria-label="TanTore rank preview">
				<RegisterRankPreview titleId="register-title" />
			</aside>

			<form class="register-form" onsubmit={handleSubmit} novalidate>
				<div class="form-title">
					<p class="caption">登録</p>
					<h2>New profile <span class="japanese-label">新しいプロフィール</span></h2>
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
					autocomplete="new-password"
					error={passwordError}
				/>

				<RegisterTextField
					id="confirm-password"
					bind:value={confirmPassword}
					label="Confirm password / パスワード確認"
					name="confirm-password"
					type="password"
					autocomplete="new-password"
					error={confirmPasswordError}
				/>

				<button type="submit">Create Account / アカウントを作成</button>

				<p class="login-link">
					Already practicing? / もう練習中ですか？ <a href={resolve('/login', {})}
						>Log in / ログイン</a
					>
				</p>
			</form>
		</div>
	</section>
</main>

<style>
	.register-page {
		min-height: 100vh;
		display: grid;
		place-items: center;
		padding: 1.5rem;
	}

	.register-shell {
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

	.register-layout {
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

	.register-form {
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

	h2,
	p {
		margin-top: 0;
	}

	h2 {
		margin-bottom: 0;
		font-size: 1.85rem;
		line-height: 1.1;
		letter-spacing: 0;
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

	button:hover {
		background: var(--color-primary-hover);
		transform: translateY(1px);
		box-shadow: 0 3px 0 var(--color-primary-active);
	}

	button:active {
		transform: translateY(4px);
		box-shadow: 0 0 0 var(--color-primary-active);
	}

	.login-link {
		margin: 0;
		color: var(--color-text-secondary);
		font-weight: 750;
		text-align: center;
	}

	.login-link a {
		color: var(--color-accent);
		font-weight: 900;
		text-decoration: none;
	}

	.login-link a:hover {
		text-decoration: underline;
	}

	@media (max-width: 760px) {
		.register-page {
			padding: 0.85rem;
			place-items: start center;
		}

		.register-layout {
			grid-template-columns: 1fr;
		}

		.rank-panel {
			border-right: 0;
			border-bottom: 1px solid var(--color-border-subtle);
			padding: 1.35rem;
		}
	}

	@media (max-width: 420px) {
		.register-page {
			padding: 0;
		}

		.register-shell {
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
