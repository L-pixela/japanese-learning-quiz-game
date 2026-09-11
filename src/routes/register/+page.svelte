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
			<p>単語トレーニング</p>
		</header>

		<div class="register-layout">
			<aside class="rank-panel" aria-label="TanTore rank preview">
				<RegisterRankPreview titleId="register-title" />
			</aside>

			<form class="register-form" onsubmit={handleSubmit} novalidate>
				<div class="form-title">
					<p class="caption">登録</p>
					<h2>New profile</h2>
				</div>

				<RegisterTextField
					id="username"
					bind:value={username}
					label="Username"
					name="username"
					autocomplete="username"
					error={usernameError}
				/>

				<RegisterTextField
					id="password"
					bind:value={password}
					label="Password"
					name="password"
					type="password"
					autocomplete="new-password"
					error={passwordError}
				/>

				<RegisterTextField
					id="confirm-password"
					bind:value={confirmPassword}
					label="Confirm password"
					name="confirm-password"
					type="password"
					autocomplete="new-password"
					error={confirmPasswordError}
				/>

				<button type="submit">Create Account</button>

				<p class="login-link">Already practicing? <a href={resolve('/login', {})}>Log in</a></p>
			</form>
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

	.register-page {
		min-height: 100vh;
		display: grid;
		place-items: center;
		padding: 1.5rem;
	}

	.register-shell {
		width: min(100%, 58rem);
		border: 1px solid #d7c8ad;
		border-radius: 8px;
		background: #fffaf0;
		box-shadow: 0 18px 42px rgba(68, 47, 25, 0.12);
	}

	.site-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
		border-bottom: 1px solid #e2d5bf;
		padding: 0.9rem 1rem;
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

	.site-header p {
		margin: 0;
		color: #75654f;
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
		border-right: 1px solid #e2d5bf;
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
			#fbf7ec;
	}

	.register-form {
		display: flex;
		flex-direction: column;
		justify-content: center;
		gap: 1rem;
		padding: clamp(1.5rem, 4vw, 3rem);
		background: linear-gradient(rgba(198, 75, 107, 0.04) 1px, transparent 1px), #fffdf8;
		background-size: 100% 3.2rem;
	}

	.form-title {
		margin-bottom: 0.35rem;
	}

	.caption {
		margin: 0 0 0.45rem;
		color: #9c3d4f;
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
		border: 1px solid #1d554b;
		border-radius: 6px;
		background: #2f6f63;
		color: #fffaf0;
		font: inherit;
		font-weight: 900;
		cursor: pointer;
		box-shadow: 0 4px 0 #1d554b;
		transition:
			transform 120ms ease,
			box-shadow 120ms ease,
			background 120ms ease;
	}

	button:hover {
		background: #285f55;
		transform: translateY(1px);
		box-shadow: 0 3px 0 #1d554b;
	}

	button:active {
		transform: translateY(4px);
		box-shadow: 0 0 0 #1d554b;
	}

	.login-link {
		margin: 0;
		color: #75654f;
		font-weight: 750;
		text-align: center;
	}

	.login-link a {
		color: #9c3d4f;
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
			border-bottom: 1px solid #e2d5bf;
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
