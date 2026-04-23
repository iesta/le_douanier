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
  const isMapTab = (i) => i === 2;

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

<div class="h-screen flex flex-col bg-gray-100 dark:bg-gray-900">
  <header class="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-2 flex-shrink-0 z-50">
    <h1 class="text-lg font-bold text-gray-900 dark:text-white">Le Douanier</h1>
    <p class="text-xs text-gray-500 dark:text-gray-400">
      {#if loading}
        Loading track...
      {:else if error}
        Error: {error}
      {:else}
        GR34 Sentier des Douaniers · {$trackPoints.length} points
      {/if}
    </p>
  </header>

  <div class="flex-1 relative overflow-hidden">
    <div class="absolute inset-0 z-0">
      <TabMap />
    </div>

    <div class="absolute inset-0 top-0 z-10 overflow-y-auto" class:pointer-events-none={isMapTab($selectedTab)}>
      {#if loading}
        <div class="flex items-center justify-center h-full">
          <div class="bg-white/90 dark:bg-gray-800/90 p-6 rounded-lg shadow-lg">
            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p class="text-sm text-gray-600 dark:text-gray-400 mt-2">Loading...</p>
          </div>
        </div>
      {:else if error}
        <div class="p-4">
          <div class="bg-white/90 dark:bg-gray-800/90 p-4 rounded-lg shadow-lg">
            <p class="text-red-800 dark:text-red-200">Failed to load track: {error}</p>
          </div>
        </div>
      {:else}
        {#each tabs as TabComponent, i}
          {#if $selectedTab === i}
            {#if !isMapTab(i)}
              <div class="bg-white/95 dark:bg-gray-800/95 min-h-full">
                <TabComponent />
              </div>
            {:else}
              <TabComponent />
            {/if}
          {/if}
        {/each}
      {/if}
    </div>
  </div>

  <TabBar />
</div>

<style>
  :global(body) {
    overflow: hidden;
  }
  :global(.leaflet-container) {
    height: 100%;
    width: 100%;
  }
</style>