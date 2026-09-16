<script lang="ts">
	import './layout.css'
	import favicon from '$lib/assets/favicon.svg'
	import { onMount } from 'svelte'
	import { i18n } from '$lib/i18n.svelte'
	import { theme } from '$lib/theme.svelte'

	let { children } = $props()

	// Language and theme are read here rather than in the app chrome: login and
	// register render their own header, so anything hydrated inside StudyShell
	// would leave those two screens stuck in English.
	onMount(() => {
		i18n.hydrate()
		theme.hydrate()
	})
</script>

<svelte:head><link rel="icon" href={favicon} /></svelte:head>
{@render children()}
