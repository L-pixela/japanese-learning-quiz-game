<script lang="ts">
	import { goto } from '$app/navigation'
	import { resolve } from '$app/paths'
	import { t } from '$lib/i18n.svelte'
	import RegisterTextField from '$lib/components/RegisterTextField.svelte'
	import JapanScene from '$lib/components/JapanScene.svelte'

	let username = $state('')
	let password = $state('')
	let submitted = $state(false)
	let serverError = $state('')
	let isSubmitting = $state(false)

	const usernameError = $derived(
		submitted && username.trim().length === 0
			? t('auth.enterUsername')
			: submitted && username.trim().length < 3
				? t('auth.usernameTooShort')
				: '',
	)
	const passwordError = $derived(
		submitted && password.length === 0
			? t('auth.enterPassword')
			: submitted && password.length < 8
				? t('auth.passwordTooShort')
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
					data.error === 'invalid credentials' ? t('auth.wrongCredentials') : t('auth.loginFailed')
				return
			}

			await goto(resolve('/dashboard', {}))
		} catch {
			serverError = t('auth.connectionFailed')
		} finally {
			isSubmitting = false
		}
	}
</script>

<main class="login-page">
	<section class="login-shell" aria-labelledby="login-title">
		<header class="site-header">
			<a class="brand-mark" href={resolve('/', {})} aria-label={t('a11y.home')}>
				<span class="brand-seal">単</span>
				<span>TanTore</span>
			</a>
			<p>{t('auth.tagline')}</p>
		</header>

		<div class="login-layout">
			<aside class="rank-panel" aria-label={t('auth.rankPreview')}>
				<div class="panel-scene"><JapanScene scene="fuji" /></div>
				<div class="preview">
					<div class="starter-rank">
						<div class="rank-emblem" aria-hidden="true">
							<span>米</span>
						</div>
						<div>
							<p class="caption">今日の練習</p>
							<h1 id="login-title">{t('auth.loginTitle')}</h1>
							<p class="intro">{t('auth.loginIntro')}</p>
						</div>
					</div>
				</div>
			</aside>

			<form class="login-form" onsubmit={handleSubmit} novalidate>
				<div class="form-title">
					<p class="caption">ログイン</p>
					<h2>{t('auth.login')}</h2>
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
					id="password"
					bind:value={password}
					label={t('auth.password')}
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
					{isSubmitting ? t('auth.loggingIn') : t('auth.login')}
				</button>

				<p class="register-link">
					{t('auth.noAccount')}
					<a href={resolve('/register', {})}>{t('auth.createAccount')}</a>
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
		padding: 2.4rem;
		background: linear-gradient(150deg, var(--color-primary) 0%, var(--color-secondary) 100%);
		color: var(--color-on-primary);
		overflow: hidden;
	}
	.panel-scene {
		position: absolute;
		inset: auto -20% -12% -20%;
		height: 62%;
		opacity: 0.45;
	}

	.preview {
		position: relative;
		z-index: 1;
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
		border-radius: var(--radius-full);
		background: rgba(255, 248, 236, 0.18);
		box-shadow: inset 0 0 0 4px rgba(255, 248, 236, 0.35);
	}

	.rank-emblem span {
		color: var(--color-on-primary);
		font-family: var(--font-display);
		font-size: 2.6rem;
		font-weight: 900;
	}

	.intro {
		margin: 0;
		color: rgba(255, 248, 236, 0.92);
		font-size: var(--font-size-body);
		line-height: var(--line-height-relaxed);
	}

	.login-form {
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
		background: rgba(255, 248, 236, 0.2);
		color: var(--color-on-primary);
		font-size: var(--font-size-caption);
		font-weight: var(--font-weight-bold);
	}
	.login-form .caption {
		background: var(--color-primary-soft);
		color: var(--color-primary-active);
	}

	h1,
	h2,
	p {
		margin-top: 0;
	}

	h1 {
		margin-bottom: 0.9rem;
		color: var(--color-on-primary);
		font-family: var(--font-display);
		font-size: var(--font-size-h1);
		font-weight: var(--font-weight-bold);
		line-height: var(--line-height-tight);
	}

	h2 {
		margin-bottom: 0;
		font-family: var(--font-display);
		font-size: var(--font-size-h2);
		font-weight: var(--font-weight-bold);
		line-height: var(--line-height-tight);
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
		color: var(--color-primary);
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
			padding: 1.6rem;
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
