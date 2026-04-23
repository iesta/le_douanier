<script>
  import { onMount } from 'svelte';
  import { selectedTab, trackPoints } from '$lib/stores/index.js';
  import { parseGPX } from '$lib/utils/geo.js';
  import TabBar from '$lib/components/TabBar.svelte';
  import TabRoute from '$lib/components/TabRoute.svelte';
  import TabDistance from '$lib/components/TabDistance.svelte';
  import TabMap from '$lib/components/TabMap.svelte';
  import TabPreferences from '$lib/components/TabPreferences.svelte';

  let loading = $state(true);
  let error = $state(null);

  const tabs = [TabRoute, TabDistance, TabMap, TabPreferences];

  onMount(async () => {
    try {
      const res = await fetch('/gpx/gr34-sentier-des-douaniers-2020.gpx');
      if (!res.ok) throw new Error('Failed to load GPX file');
      const text = await res.text();
      const points = parseGPX(text);
      trackPoints.set(points);
      loading = false;
    } catch (e) {
      error = e.message;
      loading = false;
    }
  });
</script>

<div class="min-h-screen bg-gray-50 dark:bg-gray-900">
  <header class="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3">
    <h1 class="text-lg font-bold text-gray-900 dark:text-white">Le Douanier</h1>
    <p class="text-xs text-gray-500 dark:text-gray-400">
      {#if loading}
        Loading track...
      {:else if error}
        Error: {error}
      {:else}
        GR34 Sentier des Douaniers · {$trackPoints.length} track points
      {/if}
    </p>
  </header>

  <main class="pb-16">
    {#if loading}
      <div class="flex items-center justify-center h-64">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    {:else if error}
      <div class="p-4">
        <div class="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p class="text-red-800 dark:text-red-200">Failed to load track: {error}</p>
        </div>
      </div>
    {:else}
      {#each tabs as TabComponent, i}
        {#if $selectedTab === i}
          <TabComponent />
        {/if}
      {/each}
    {/if}
  </main>

  <TabBar />
</div>