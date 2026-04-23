<script>
  import { selectedGpx, availableGPX, trackPoints, trackName } from '$lib/stores/index.js';
  import { parseGPX } from '$lib/utils/geo.js';
  import { selectedTab } from '$lib/stores/index.js';

  let loading = $state(false);
  let error = $state(null);

  async function selectGpx(gpx) {
    loading = true;
    error = null;
    selectedGpx.set(gpx.file);
    localStorage.setItem('le_douanier_selected_gpx', gpx.file);

    try {
      const res = await fetch(`/gpx/${gpx.file}`);
      if (!res.ok) throw new Error('Failed to load GPX');
      const text = await res.text();
      const points = parseGPX(text);
      trackPoints.set(points);
      trackName.set(gpx.name);
    } catch (e) {
      error = e.message;
    } finally {
      loading = false;
    }
  }

  function goToRoute() {
    selectedTab.set(1);
  }
</script>

<div class="p-4 pb-20">
  <h2 class="text-xl font-bold mb-4 text-gray-900 dark:text-white">Select a Trail</h2>

  {#if loading}
    <div class="flex justify-center p-8">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>
  {:else if error}
    <div class="p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
      Error: {error}
    </div>
  {:else}
    <div class="space-y-3">
      {#each $availableGPX as gpx}
        <button
          onclick={() => selectGpx(gpx)}
          class="w-full p-4 text-left rounded-lg border-2 transition-colors {$selectedGpx === gpx.file
            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
            : 'border-gray-200 dark:border-gray-700 hover:border-blue-300'}"
        >
          <h3 class="font-semibold text-gray-900 dark:text-white">{gpx.name}</h3>
          <p class="text-sm text-gray-500 mt-1">{gpx.distance}</p>
        </button>
      {/each}
    </div>
  {/if}

  {#if $trackPoints.length > 0}
    <div class="mt-6 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
      <p class="text-sm text-green-800 dark:text-green-200">
        <span class="font-semibold">{$trackName}</span> loaded<br/>
        <span class="text-xs">{$trackPoints.length} track points</span>
      </p>
      <button
        onclick={goToRoute}
        class="mt-3 w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
      >
        Plan a Route →
      </button>
    </div>
  {/if}
</div>