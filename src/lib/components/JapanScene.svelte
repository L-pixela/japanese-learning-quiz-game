<script lang="ts">
	// Flat Japanese scenes drawn inline so they scale and cost no extra request.
	// Colours are fixed rather than tokenised: every scene sits on an always-dark
	// panel, so inverting them with the theme would break their contrast. 'fuji' sits behind the dashboard hero, 'torii' celebrates a
	// passed quiz, 'daruma' softens a failed one — a daruma gets its second eye
	// painted in only once its wish comes true, which is exactly "come back and pass".
	let {
		scene = 'fuji',
		class: className = '',
	}: { scene?: 'fuji' | 'torii' | 'daruma'; class?: string } = $props()
</script>

<svg
	class={'japan-scene ' + className}
	viewBox="0 0 400 300"
	role="presentation"
	aria-hidden="true"
	preserveAspectRatio="xMidYMid slice"
>
	{#if scene === 'fuji'}
		<circle cx="292" cy="86" r="50" fill="#dcccac" opacity=".95" />
		<path d="M8 255 L150 78 L292 255 Z" fill="#99ad7a" />
		<path d="M106 133 L150 78 L194 133 L172 120 L150 140 L128 120 Z" fill="#fbf7ec" />
		<path d="M8 255 L96 148 L184 255 Z" fill="#7f9463" opacity=".85" />
		<g stroke="#fbf7ec" stroke-opacity=".5" stroke-width="3" fill="none" stroke-linecap="round">
			<path d="M18 272q24-18 48 0t48 0t48 0t48 0t48 0t48 0t48 0" />
			<path d="M18 288q24-18 48 0t48 0t48 0t48 0t48 0t48 0t48 0" />
		</g>
		<g fill="#dcccac">
			<ellipse cx="60" cy="60" rx="7" ry="11" transform="rotate(-25 60 60)" />
			<ellipse cx="98" cy="34" rx="6" ry="9" transform="rotate(18 98 34)" />
			<ellipse cx="342" cy="180" rx="7" ry="11" transform="rotate(35 342 180)" />
			<ellipse cx="44" cy="152" rx="6" ry="9" transform="rotate(-10 44 152)" />
		</g>
	{:else if scene === 'torii'}
		<circle cx="200" cy="128" r="78" fill="#dcccac" />
		<g fill="#99ad7a">
			<path d="M96 74h208l-10 20H106z" />
			<path d="M112 100h176v16H112z" />
			<rect x="126" y="116" width="26" height="150" />
			<rect x="248" y="116" width="26" height="150" />
			<path d="M86 62h228l-8 14H94z" />
		</g>
		<g fill="#fbf7ec" opacity=".9">
			<ellipse cx="64" cy="90" rx="8" ry="12" transform="rotate(-25 64 90)" />
			<ellipse cx="336" cy="72" rx="8" ry="12" transform="rotate(30 336 72)" />
			<ellipse cx="52" cy="196" rx="7" ry="10" transform="rotate(12 52 196)" />
			<ellipse cx="350" cy="200" rx="7" ry="10" transform="rotate(-18 350 200)" />
			<ellipse cx="200" cy="40" rx="7" ry="10" />
		</g>
	{:else}
		<path
			d="M200 40c62 0 104 52 104 118 0 62-44 102-104 102S96 220 96 158C96 92 138 40 200 40Z"
			fill="#99ad7a"
		/>
		<ellipse cx="200" cy="168" rx="74" ry="62" fill="#dcccac" />
		<g fill="#2a3721">
			<ellipse cx="170" cy="150" rx="15" ry="19" />
			<ellipse cx="230" cy="150" rx="15" ry="19" fill="none" stroke="#2a3721" stroke-width="4" />
		</g>
		<path
			d="M176 196q24 18 48 0"
			stroke="#2a3721"
			stroke-width="5"
			fill="none"
			stroke-linecap="round"
		/>
		<path
			d="M150 108q50-26 100 0"
			stroke="#2a3721"
			stroke-width="5"
			fill="none"
			stroke-linecap="round"
		/>
	{/if}
</svg>

<style>
	.japan-scene {
		display: block;
		width: 100%;
		height: 100%;
	}
</style>
