<script>
	import '../app.css';
	import { onMount } from 'svelte';
	import { VERSION } from '$lib/version.js';
	import { dev } from '$app/environment';

	let { children } = $props();

	onMount(async () => {
		if (dev) {
			try {
				const regs = await navigator.serviceWorker.getRegistrations();
				for (const reg of regs) {
					await reg.unregister();
				}
			} catch (e) {}
			return;
		}
		if ('serviceWorker' in navigator) {
			navigator.serviceWorker.register('/sw.js');
		}
	});
</script>

<svelte:head>
	<title>{dev ? 'Le Douanier ' + VERSION : 'Le Douanier'}</title>
</svelte:head>

{@render children()}