<script>
  import { selectedGpx, availableGPX, trackPoints, trackName } from '$lib/stores/index.js';
  import { parseGPX } from '$lib/utils/geo.js';
  import { selectedTab } from '$lib/stores/index.js';

  let loading = $state(false);
  let error = $state(null);

  async function selectGpx(event) {
    const file = event.target.value;
    const gpx = $availableGPX.find(g => g.file === file);
    if (!gpx) return;

    loading = true;
    error = null;
    selectedGpx.set(file);
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('le_douanier_selected_gpx', file);
    }

    try {
      const res = await fetch(`/gpx/${file}`);
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

<div class="p-4 pb-20 space-y-6">
  <h2 class="text-xl font-bold text-gray-900 dark:text-white">Select a Trail</h2>

  <div class="relative">
    <select
      onchange={selectGpx}
      value={$selectedGpx}
      class="w-full px-4 py-3 bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white appearance-none cursor-pointer hover:border-blue-400 focus:border-blue-500 focus:outline-none"
    >
      {#each $availableGPX as gpx}
        <option value={gpx.file}>{gpx.name} ({gpx.distance})</option>
      {/each}
    </select>
    <div class="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
      <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
      </svg>
    </div>
  </div>

  {#if loading}
    <div class="flex justify-center p-8">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>
  {:else if error}
    <div class="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-800 dark:text-red-200">
      Error: {error}
    </div>
  {/if}

  {#if $trackPoints.length > 0}
    <div class="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
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