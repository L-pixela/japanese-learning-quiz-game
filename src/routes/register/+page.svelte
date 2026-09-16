<script lang="ts">
	import { goto } from '$app/navigation'
	import { resolve } from '$app/paths'
	import { t } from '$lib/i18n.svelte'
	import RegisterRankPreview from '$lib/components/RegisterRankPreview.svelte'
	import JapanScene from '$lib/components/JapanScene.svelte'
	import RegisterTextField from '$lib/components/RegisterTextField.svelte'

	let username = $state('')
	let university = $state('')
	let password = $state('')
	let confirmPassword = $state('')
	let submitted = $state(false)
	let serverError = $state('')
	let isSubmitting = $state(false)

	const usernameError = $derived(
		submitted && username.trim().length === 0
			? t('auth.chooseUsername')
			: submitted && username.trim().length < 3
				? t('auth.usernameTooShort')
				: '',
	)
	const passwordError = $derived(
		submitted && password.length === 0
			? t('auth.createPassword')
			: submitted && password.length < 8
				? t('auth.passwordTooShort')
				: '',
	)
	const confirmPasswordError = $derived(
		submitted && confirmPassword.length === 0
			? t('auth.confirmYourPassword')
			: submitted && password !== confirmPassword
				? t('auth.passwordsDiffer')
				: '',
	)
	const isValid = $derived(!usernameError && !passwordError && !confirmPasswordError)

	async function handleSubmit(event: SubmitEvent) {
		event.preventDefault()
		submitted = true
		serverError = ''

		if (!isValid || isSubmitting) return

		isSubmitting = true

		try {
			const response = await fetch('/api/register', {
				method: 'POST',
				headers: { 'content-type': 'application/json' },
				body: JSON.stringify({
					username: username.trim(),
					password,
					university: university.trim(),
				}),
			})

			if (!response.ok) {
				const data = (await response.json()) as { error?: string }
				serverError =
					data.error === 'username already taken'
						? t('auth.usernameTaken')
						: t('auth.registerFailed')
				return
			}

			await goto(resolve('/login', {}))
		} catch {
			serverError = t('auth.connectionFailed')
		} finally {
			isSubmitting = false
		}
	}
</script>

<main class="register-page">
	<section class="register-shell" aria-labelledby="register-title">
		<header class="site-header">
			<a class="brand-mark" href={resolve('/', {})} aria-label={t('a11y.home')}>
				<span class="brand-seal">単</span>
				<span>TanTore</span>
			</a>
			<p>{t('auth.tagline')}</p>
		</header>

		<div class="register-layout">
			<aside class="rank-panel" aria-label={t('auth.rankPreview')}>
				<div class="panel-scene"><JapanScene scene="torii" /></div>
				<RegisterRankPreview titleId="register-title" />
			</aside>

			<form method="POST" class="register-form" onsubmit={handleSubmit} novalidate>
				<div class="form-title">
					<p class="caption">登録</p>
					<h2>{t('auth.newProfile')}</h2>
				</div>

				<RegisterTextField
					id="username"
					bind:value={username}
					label={t('auth.username')}
					name="username"
					autocomplete="username"
					error={usernameError}
				/>

				<RegisterTextField
					id="university"
					name="university"
					label={t('auth.university')}
					bind:value={university}
					autocomplete="organization"
				/>

				<RegisterTextField
					id="password"
					bind:value={password}
					label={t('auth.password')}
					name="password"
					type="password"
					autocomplete="new-password"
					error={passwordError}
					showPasswordToggle
				/>

				<RegisterTextField
					id="confirm-password"
					bind:value={confirmPassword}
					label={t('auth.confirmPassword')}
					name="confirm-password"
					type="password"
					autocomplete="new-password"
					error={confirmPasswordError}
					showPasswordToggle
				/>

				{#if serverError}
					<p class="server-error" role="alert">{serverError}</p>
				{/if}

				<button type="submit" disabled={isSubmitting}>
					{isSubmitting ? t('auth.creating') : t('auth.register')}
				</button>

				<p class="login-link">
					{t('auth.haveAccount')} <a href={resolve('/login', {})}>{t('auth.login')}</a>
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
		width: min(100%, 60rem);
		border-radius: var(--radius-xl);
		background: var(--color-surface);
		box-shadow: var(--shadow-lg);
		overflow: hidden;
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
		padding: 2.4rem;
		background: linear-gradient(150deg, var(--color-primary) 0%, var(--color-secondary) 100%);
		color: var(--color-on-primary);
		overflow: hidden;
	}
	.panel-scene {
		position: absolute;
		inset: auto -15% -10% -15%;
		height: 58%;
		opacity: 0.4;
	}
	.rank-panel :global(*) {
		position: relative;
		z-index: 1;
	}

	.register-form {
		display: flex;
		flex-direction: column;
		justify-content: center;
		gap: 1.1rem;
		padding: clamp(1.6rem, 4vw, 3rem);
		background: var(--color-surface);
	}

	.form-title {
		margin-bottom: 0.35rem;
	}

	.caption {
		display: inline-block;
		margin: 0 0 0.6rem;
		padding: 6px 14px;
		border-radius: var(--radius-full);
		background: var(--color-primary-soft);
		color: var(--color-primary-active);
		font-size: var(--font-size-caption);
		font-weight: var(--font-weight-bold);
	}

	h2,
	p {
		margin-top: 0;
	}

	h2 {
		margin-bottom: 0;
		font-family: var(--font-display);
		font-size: var(--font-size-h2);
		font-weight: var(--font-weight-bold);
		line-height: var(--line-height-tight);
		letter-spacing: 0;
	}

	button {
		min-height: 3.4rem;
		border: 0;
		border-radius: var(--radius-full);
		background: var(--color-primary);
		color: var(--color-on-primary);
		font: inherit;
		font-family: var(--font-display);
		font-size: var(--font-size-body);
		font-weight: 900;
		cursor: pointer;
		box-shadow: var(--shadow-solid) var(--color-primary-active);
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

	button:disabled {
		opacity: 0.7;
		cursor: not-allowed;
	}

	.server-error {
		margin: 0;
		color: var(--color-danger);
		font-weight: 700;
		font-size: 0.9rem;
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
			padding: 1.6rem;
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
