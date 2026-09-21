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
		/* border-box or the padding is added on top of the full-viewport
		   min-height and the page scrolls by exactly the padding. This screen
		   sits outside .study-app, so it does not inherit that reset. */
		box-sizing: border-box;
		min-height: calc(100vh / var(--app-zoom));
		min-height: calc(100dvh / var(--app-zoom));
		display: grid;
		place-items: center;
		padding: 1.5rem;
	}
	.login-page *,
	.login-page *::before,
	.login-page *::after {
		box-sizing: border-box;
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
		padding: var(--spacing-lg);
		background: var(--color-surface);
	}

	.form-title {
		margin-bottom: 0.35rem;
	}

	.caption {
		display: inline-block;
		margin: 0 0 0.6rem;
		padding: var(--spacing-sm) var(--spacing-md);
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

	/* ============================================================
	   PHONE AND SMALL TABLET: log in without scrolling.

	   On a wide screen the rank panel sits beside the form and costs
	   nothing. Stacked on a phone it is a 400px advertisement above the
	   two fields someone came here to fill in, which is what pushed the
	   button off screen. So on a phone it stops being a panel and becomes
	   a title band, and the form takes the rest of the screen.
	   ============================================================ */
	@media (max-width: 760px) {
		.login-page {
			min-height: calc(100dvh / var(--app-zoom));
			height: calc(100dvh / var(--app-zoom));
			padding: 0;
			place-items: stretch;
		}

		.login-shell {
			display: flex;
			flex-direction: column;
			width: 100%;
			border-radius: 0;
			box-shadow: none;
		}

		.site-header {
			flex-shrink: 0;
			padding: var(--spacing-sm) var(--spacing-md);
		}
		/* The tagline repeats what the band below already says. */
		.site-header p {
			display: none;
		}

		.login-layout {
			flex: 1 1 auto;
			min-height: 0;
			grid-template-columns: 1fr;
			grid-template-rows: auto minmax(0, 1fr);
		}

		/* Band, not panel: the scenery is the first thing to go. */
		.rank-panel {
			gap: 0;
			padding: var(--spacing-md);
		}

		.panel-scene {
			display: none;
		}

		.starter-rank {
			grid-template-columns: auto minmax(0, 1fr);
			align-items: center;
			gap: var(--spacing-md);
		}

		.rank-emblem {
			width: 3rem;
			height: 3rem;
		}

		.rank-emblem span {
			font-size: 1.4rem;
		}

		.intro {
			display: none;
		}

		h1 {
			margin: 0;
			font-size: 1.4rem;
		}

		/* Top aligned, not centred. Centring inside a tall phone column leaves
		   a void above and below the two fields and reads as a broken screen;
		   sitting under the band with one consistent gap does not. */
		.login-form {
			justify-content: flex-start;
			min-height: 0;
			gap: var(--spacing-md);
			padding: clamp(16px, 4dvh, 40px) var(--spacing-md) var(--spacing-md);
			/* Only if a translation or a validation message genuinely needs it. */
			overflow-y: auto;
		}
	}

	@media (max-width: 420px) {
		.login-shell {
			border: 0;
		}
	}
	/* Phone on its side: 375px of height leaves no room for a title band at
	   all, so the form is the whole screen. */
	@media (max-height: 520px) and (orientation: landscape) {
		/* A landscape phone is wider than the 760px phone breakpoint, so it
		   never picked up the fixed shell and scrolled instead. */
		.login-page {
			height: calc(100dvh / var(--app-zoom));
			padding: 0;
			place-items: stretch;
		}
		.login-shell {
			display: flex;
			flex-direction: column;
			width: 100%;
			border-radius: 0;
			box-shadow: none;
		}
		.login-layout {
			flex: 1 1 auto;
			min-height: 0;
			grid-template-columns: 1fr;
		}
		.login-form {
			min-height: 0;
			overflow-y: auto;
		}
		.site-header p {
			display: none;
		}
		.rank-panel {
			display: none;
		}
		.site-header {
			padding: 4px var(--spacing-md);
		}
		.login-layout {
			grid-template-rows: minmax(0, 1fr);
		}
		.login-form {
			gap: var(--spacing-sm);
			padding: var(--spacing-sm) var(--spacing-md);
		}
		.form-title {
			margin: 0;
		}
		.form-title h2 {
			font-size: 1.1rem;
			margin: 0;
		}
		.login-form .caption {
			display: none;
		}
	}
	/* Short screens — small phones and any phone on its side. Everything that
	   is decoration rather than the two fields and the button gives up room. */
	@media (max-height: 620px) {
		.rank-panel {
			padding: var(--spacing-sm) var(--spacing-md);
		}
		.rank-emblem {
			width: 2.2rem;
			height: 2.2rem;
		}
		.rank-emblem span {
			font-size: 1rem;
		}
		h1 {
			font-size: 1.1rem;
		}
		.rank-panel .caption {
			display: none;
		}
		.login-form {
			gap: var(--spacing-sm);
			padding: var(--spacing-sm) var(--spacing-md);
		}
		.login-form :global(input) {
			min-height: 2.6rem;
		}
		.login-form button[type='submit'] {
			min-height: 2.6rem;
		}
		.register-link {
			margin: 0;
			font-size: var(--text-xs);
		}
	}
</style>
