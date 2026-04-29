<script>
  import { onMount } from 'svelte';
  import { selectedTab, trackPoints, trackName, selectedGpx, availableGPX, preferences } from '$lib/stores/index.js';
  import { parseGPX } from '$lib/utils/geo.js';
  import TabBar from '$lib/components/TabBar.svelte';
  import TabGpx from '$lib/components/TabGpx.svelte';
  import TabRoute from '$lib/components/TabRoute.svelte';
  import TabDistance from '$lib/components/TabDistance.svelte';
  import TabMap from '$lib/components/TabMap.svelte';
  import TabPreferences from '$lib/components/TabPreferences.svelte';

  let loading = $state(true);
  let error = $state(null);

  const tabs = [TabGpx, TabRoute, TabDistance, TabMap, TabPreferences];

  onMount(async () => {
    try {
      const gpxFile = $selectedGpx || 'gr34-sentier-des-douaniers-2020.gpx';
      const gpxInfo = $availableGPX.find(g => g.file === gpxFile);
      if (gpxInfo) {
        trackName.set(gpxInfo.name);
      }
      const res = await fetch(`/gpx/${gpxFile}`);
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

  $effect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.classList.toggle('dark', $preferences.darkMode);
    }
  });
</script>

<div class="h-screen w-screen flex flex-col overflow-hidden bg-gray-100 dark:bg-gray-900">
  <header class="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-2 flex-shrink-0 z-20">
    <h1 class="text-lg font-bold text-gray-900 dark:text-white">Le Douanier</h1>
    <p class="text-xs text-gray-500 dark:text-gray-400">
      {#if loading}
        Loading...
      {:else if error}
        {error}
      {:else}
        {$trackName || 'GR34'} · {$trackPoints.length} points
      {/if}
    </p>
  </header>

  <div class="flex-1 relative overflow-hidden">
    {#if $selectedTab === 3}
      <div class="absolute inset-0 z-0">
        <TabMap />
      </div>
    {:else}
      <div class="absolute inset-0 z-0 bg-gray-100 dark:bg-gray-900"></div>
    {/if}

    {#if !loading && !error}
      {#if $selectedTab === 0}
        <div class="absolute inset-x-0 top-0 z-10 overflow-y-auto max-h-full pb-20">
          <div class="bg-white/95 dark:bg-gray-800/95 min-h-full">
            <TabGpx />
          </div>
        </div>
      {:else if $selectedTab === 1}
        <div class="absolute inset-x-0 top-0 z-10 overflow-y-auto max-h-full pb-20">
          <div class="bg-white/95 dark:bg-gray-800/95 min-h-full">
            <TabRoute />
          </div>
        </div>
      {:else if $selectedTab === 2}
        <div class="absolute inset-x-0 top-0 z-10 overflow-y-auto max-h-full pb-20">
          <div class="bg-white/95 dark:bg-gray-800/95 min-h-full">
            <TabDistance />
          </div>
        </div>
      {:else if $selectedTab === 4}
        <div class="absolute inset-x-0 top-0 z-10 overflow-y-auto max-h-full pb-20">
          <div class="bg-white/95 dark:bg-gray-800/95 min-h-full">
            <TabPreferences />
          </div>
        </div>
      {/if}
    {/if}
  </div>

  <TabBar />
</div>

<style>
  :global(body) { margin: 0; padding: 0; overflow: hidden; }
</style>