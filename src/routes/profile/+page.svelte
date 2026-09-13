<script lang="ts">
	import { untrack } from 'svelte'
	import { goto, invalidateAll } from '$app/navigation'
	import { resolve } from '$app/paths'
	import StudyShell from '$lib/components/StudyShell.svelte'
	import RankBadge from '$lib/components/rank_badge.svelte'
	import { t } from '$lib/i18n.svelte'
	import type { PageData } from './$types'

	let { data }: { data: PageData } = $props()

	let editing = $state(false)
	let avatar = $state<string | null>(untrack(() => data.profile.avatar))
	let busy = $state(false)
	let message = $state('')
	let error = $state('')

	/**
	 * Resize the chosen picture to a 256px square in the browser before it ever
	 * leaves the page. That keeps the stored value to tens of KB, so a photo
	 * needs no object storage.
	 */
	async function pickPhoto(event: Event) {
		const input = event.currentTarget as HTMLInputElement
		const file = input.files?.[0]
		input.value = ''
		if (!file) return
		if (!file.type.startsWith('image/')) {
			error = t('profile.photoBadType')
			return
		}
		error = ''
		try {
			const bitmap = await createImageBitmap(file)
			const size = 256
			const canvas = document.createElement('canvas')
			canvas.width = size
			canvas.height = size
			const context = canvas.getContext('2d')
			if (!context) throw new Error('canvas unavailable')
			// Cover-crop from the centre so portraits are not squashed.
			const side = Math.min(bitmap.width, bitmap.height)
			context.drawImage(
				bitmap,
				(bitmap.width - side) / 2,
				(bitmap.height - side) / 2,
				side,
				side,
				0,
				0,
				size,
				size,
			)
			bitmap.close()
			const encoded = canvas.toDataURL('image/webp', 0.85)
			if (encoded.length > 256 * 1024) {
				error = t('profile.photoTooBig')
				return
			}
			avatar = encoded
		} catch {
			error = t('profile.photoBadType')
		}
	}

	/** A snapshot of the saved profile, used to seed and to reset the form. */
	function fromProfile() {
		return {
			displayName: data.profile.displayName ?? '',
			university: data.profile.university ?? '',
			phone: data.profile.phone ?? '',
			linkedin: data.profile.linkedin ?? '',
			github: data.profile.github ?? '',
			bio: data.profile.bio ?? '',
		}
	}
	// Seeded once; edits belong to the form until saved.
	let form = $state(untrack(fromProfile))

	function reset() {
		form = fromProfile()
		avatar = data.profile.avatar
		editing = false
		error = ''
	}

	async function save(event: SubmitEvent) {
		event.preventDefault()
		if (busy) return
		busy = true
		error = ''
		message = ''
		try {
			const response = await fetch('/api/profile', {
				method: 'PATCH',
				headers: { 'content-type': 'application/json' },
				body: JSON.stringify({ ...form, avatar: avatar ?? '' }),
			})
			if (response.status === 401) return await goto(resolve('/login', {}))
			const body = (await response.json()) as { error?: string }
			if (!response.ok) throw new Error(body.error ?? 'Unable to save.')
			message = t('profile.saved')
			editing = false
			await invalidateAll()
		} catch (e) {
			error = e instanceof Error ? e.message : 'Unable to save.'
		} finally {
			busy = false
		}
	}

	async function signOut() {
		await fetch('/api/logout', { method: 'POST' })
		await goto(resolve('/login', {}))
	}

	let passed = $derived(data.history.filter((attempt) => attempt.score >= 6).length)
</script>

<svelte:head><title>{t('profile.title')} · TanTore</title></svelte:head>
<StudyShell>
	<div class="study-heading">
		<div class="identity">
			{#if data.profile.avatar}
				<img class="avatar" src={data.profile.avatar} alt="" />
			{:else}
				<span class="avatar placeholder" aria-hidden="true"
					>{(data.profile.displayName || data.profile.username).slice(0, 1).toUpperCase()}</span
				>
			{/if}
			<div>
				<p class="study-eyebrow">{t('profile.eyebrow')}</p>
				<h1>{data.profile.displayName || data.profile.username}</h1>
				<p class="study-muted">@{data.profile.username}</p>
			</div>
		</div>
		<button class="study-button secondary" onclick={signOut}>{t('auth.signOut')}</button>
	</div>

	<section class="study-metrics" aria-label={t('profile.eyebrow')}>
		<div class="study-metric">
			<small>{t('profile.points')}</small><strong>{data.profile.points.toLocaleString()}</strong>
		</div>
		<div class="study-metric">
			<small>{t('profile.ranking')}</small><strong
				>{data.position ? '#' + data.position : '·'}</strong
			>
		</div>
		<div class="study-metric">
			<small>{t('profile.streak')}</small><strong
				>{data.profile.streak}<span> {t('dashboard.streakDays')}</span></strong
			>
		</div>
		<div class="study-metric">
			<small>{t('profile.rank')}</small>
			<RankBadge streak={data.profile.streak} size="md" />
		</div>
	</section>

	{#if message}<p class="notice" role="status">{message}</p>{/if}
	{#if error}<p class="study-error" role="alert">{error}</p>{/if}

	<div class="profile-grid">
		<section class="study-panel">
			<div class="panel-head">
				<h2>{t('profile.edit')}</h2>
				{#if !editing}
					<button class="study-button secondary small" onclick={() => (editing = true)}
						>{t('profile.edit')}</button
					>
				{/if}
			</div>

			{#if editing}
				<form onsubmit={save}>
					<div class="photo-field">
						{#if avatar}
							<img class="avatar" src={avatar} alt="" />
						{:else}
							<span class="avatar placeholder" aria-hidden="true">
								{(form.displayName || data.profile.username).slice(0, 1).toUpperCase()}
							</span>
						{/if}
						<div class="photo-actions">
							<span class="photo-title">{t('profile.photo')}</span>
							<div class="photo-buttons">
								<label class="file-button"
									>{t('profile.choosePhoto')}<input
										type="file"
										accept="image/png,image/jpeg,image/webp"
										onchange={pickPhoto}
									/></label
								>
								{#if avatar}
									<button type="button" class="link-button" onclick={() => (avatar = null)}
										>{t('profile.removePhoto')}</button
									>
								{/if}
							</div>
							<small>{t('profile.photoHint')}</small>
						</div>
					</div>
					<label
						>{t('profile.displayName')}<input bind:value={form.displayName} maxlength="60" /></label
					>
					<label>{t('auth.university')}<input bind:value={form.university} maxlength="200" /></label
					>
					<label
						>{t('profile.phone')}<input
							bind:value={form.phone}
							type="tel"
							inputmode="tel"
							maxlength="40"
						/></label
					>
					<label
						>{t('profile.linkedin')}<input
							bind:value={form.linkedin}
							maxlength="200"
							placeholder="linkedin.com/in/…"
						/></label
					>
					<label
						>{t('profile.github')}<input
							bind:value={form.github}
							maxlength="100"
							placeholder="github.com/…"
						/></label
					>
					<label
						>{t('profile.bio')}<textarea bind:value={form.bio} rows="3" maxlength="500"
						></textarea></label
					>
					<div class="form-actions">
						<button class="study-button" type="submit" disabled={busy}
							>{busy ? t('profile.saving') : t('profile.save')}</button
						>
						<button class="study-button secondary" type="button" onclick={reset}
							>{t('profile.cancel')}</button
						>
					</div>
				</form>
			{:else}
				<dl class="details">
					<div>
						<dt>{t('profile.displayName')}</dt>
						<dd>{data.profile.displayName || t('profile.notSet')}</dd>
					</div>
					<div>
						<dt>{t('auth.university')}</dt>
						<dd>{data.profile.university || t('profile.notSet')}</dd>
					</div>
					<div>
						<dt>{t('profile.phone')}</dt>
						<dd>{data.profile.phone || t('profile.notSet')}</dd>
					</div>
					<div>
						<dt>{t('profile.linkedin')}</dt>
						<dd>{data.profile.linkedin || t('profile.notSet')}</dd>
					</div>
					<div>
						<dt>{t('profile.github')}</dt>
						<dd>{data.profile.github || t('profile.notSet')}</dd>
					</div>
					<div class="wide">
						<dt>{t('profile.bio')}</dt>
						<dd>{data.profile.bio || t('profile.notSet')}</dd>
					</div>
				</dl>
			{/if}
		</section>

		<section class="study-panel">
			<div class="panel-head">
				<h2>{t('profile.history')}</h2>
				<span class="count">{t('profile.attempts', { n: data.history.length })}</span>
			</div>
			{#if data.history.length === 0}
				<p class="study-muted">{t('profile.noHistory')}</p>
			{:else}
				<p class="study-muted summary">
					{passed} / {data.history.length}
					{t('profile.passed')}
				</p>
				<ol class="history">
					{#each data.history as attempt (attempt.id)}
						<li>
							<span class="h-level">{t('profile.historyLevel', { level: attempt.level })}</span>
							<span class="h-score">{attempt.score}<small>/10</small></span>
							<span class={'study-pill ' + (attempt.score >= 6 ? 'completed' : 'attempted')}
								>{attempt.score >= 6 ? t('profile.passed') : t('profile.failed')}</span
							>
						</li>
					{/each}
				</ol>
			{/if}
		</section>
	</div>
</StudyShell>

<style>
	.identity {
		display: flex;
		align-items: center;
		gap: var(--spacing-md);
		min-width: 0;
	}
	.avatar {
		width: 84px;
		height: 84px;
		flex-shrink: 0;
		border-radius: var(--radius-full);
		object-fit: cover;
		background: var(--color-primary-soft);
	}
	.placeholder {
		display: grid;
		place-items: center;
		background: var(--color-primary);
		color: var(--color-on-primary);
		font-family: var(--font-display);
		font-size: var(--text-2xl);
		font-weight: var(--font-weight-bold);
	}
	.photo-field {
		display: flex;
		align-items: center;
		gap: var(--spacing-md);
		padding-bottom: var(--spacing-md);
		border-bottom: 1px solid var(--color-border-subtle);
	}
	.photo-title {
		display: block;
		margin-bottom: 8px;
		font-size: var(--text-sm);
		font-weight: var(--font-weight-semibold);
	}
	.photo-buttons {
		display: flex;
		align-items: center;
		gap: 12px;
		flex-wrap: wrap;
	}
	.file-button {
		display: inline-flex;
		align-items: center;
		padding: 10px 20px;
		border-radius: var(--radius-full);
		background: var(--color-primary);
		color: var(--color-on-primary);
		box-shadow: var(--shadow-solid) var(--color-primary-shadow);
		font-size: var(--text-sm);
		font-weight: var(--font-weight-bold);
		cursor: pointer;
	}
	.file-button input {
		display: none;
	}
	.link-button {
		border: 0;
		background: none;
		color: var(--color-text-secondary);
		font: inherit;
		font-size: var(--text-sm);
		font-weight: var(--font-weight-semibold);
		text-decoration: underline;
		cursor: pointer;
	}
	.photo-field small {
		display: block;
		margin-top: 8px;
		color: var(--color-text-faint);
		font-size: var(--text-xs);
	}
	.notice {
		padding: 14px 18px;
		border-radius: var(--radius-md);
		background: var(--color-success-soft);
		color: var(--color-primary);
		font-weight: var(--font-weight-semibold);
	}
	.profile-grid {
		display: grid;
		grid-template-columns: 1.15fr 1fr;
		gap: var(--spacing-lg);
		align-items: start;
	}
	.panel-head {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 12px;
		margin-bottom: var(--spacing-lg);
	}
	.count {
		color: var(--color-text-secondary);
		font-size: var(--text-sm);
	}
	.small {
		min-height: 44px;
		padding: 10px 20px;
		font-size: var(--text-sm);
	}
	form {
		display: grid;
		gap: var(--spacing-md);
	}
	label {
		display: grid;
		gap: 8px;
		font-size: var(--text-sm);
		font-weight: var(--font-weight-semibold);
	}
	input,
	textarea {
		width: 100%;
		min-height: 54px;
		padding: 14px 18px;
		border: 2px solid var(--color-input-border);
		border-radius: var(--radius-md);
		background: var(--color-surface-sunken);
		color: var(--color-text);
		font: inherit;
		font-size: var(--text-base);
		font-weight: var(--font-weight-regular);
	}
	textarea {
		resize: vertical;
	}
	input:focus,
	textarea:focus {
		border-color: var(--color-primary);
		outline: none;
	}
	.form-actions {
		display: flex;
		gap: 12px;
		flex-wrap: wrap;
	}
	.details {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: var(--spacing-md) var(--spacing-lg);
		margin: 0;
	}
	.details .wide {
		grid-column: 1 / -1;
	}
	dt {
		margin-bottom: 4px;
		color: var(--color-text-secondary);
		font-size: var(--text-sm);
		font-weight: var(--font-weight-semibold);
	}
	dd {
		margin: 0;
		font-size: var(--text-base);
		overflow-wrap: anywhere;
	}
	.summary {
		margin-bottom: var(--spacing-md);
	}
	.history {
		list-style: none;
		margin: 0;
		padding: 0;
		max-height: 420px;
		overflow-y: auto;
	}
	.history li {
		display: grid;
		grid-template-columns: 1fr auto auto;
		gap: 12px;
		align-items: center;
		padding: 14px 0;
		border-bottom: 1px solid var(--color-border-subtle);
	}
	.history li:last-child {
		border-bottom: 0;
	}
	.h-level {
		font-weight: var(--font-weight-semibold);
	}
	.h-score {
		font-family: var(--font-display);
		font-size: var(--text-lg);
		font-weight: var(--font-weight-bold);
		color: var(--color-primary);
	}
	.h-score small {
		color: var(--color-text-faint);
		font-size: var(--text-sm);
	}
	@media (max-width: 900px) {
		.profile-grid {
			grid-template-columns: 1fr;
		}
	}
	@media (max-width: 540px) {
		.details {
			grid-template-columns: 1fr;
		}
	}
</style>
