<script>
	import '../app.css';
	import { onMount } from 'svelte';
	import { VERSION } from '$lib/version.js';
	import { dev } from '$app/environment';

	let { children } = $props();

	onMount(() => {
		if (import.meta.env.VITE_DEV_MODE) return;
		if ('serviceWorker' in navigator) {
			navigator.serviceWorker.register('/sw.js');
		}
	});
</script>

<svelte:head>
	<title>{dev ? 'Le Douanier ' + VERSION : 'Le Douanier'}</title>
</svelte:head>

{@render children()}