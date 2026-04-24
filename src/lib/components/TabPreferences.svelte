<script>
  import { preferences, recentPlacesForCurrentGpx, historyForCurrentGpx, clearHistory, originPoint, destinationPoint, addToRecentPlaces, selectedTab, updatePreferences } from '$lib/stores/index.js';
  import { VERSION } from '$lib/version.js';

  function formatNumber(num) {
    return num.toLocaleString('de-DE', { maximumFractionDigits: 2 });
  }

  function formatDistance(meters) {
    return formatNumber(meters / 1000) + ' km';
  }

  function selectHistoryItem(item) {
    originPoint.set(item.origin);
    destinationPoint.set(item.destination);
    addToRecentPlaces(item.origin);
    addToRecentPlaces(item.destination);
    selectedTab.set(1);
  }

  function selectPlace(item) {
    originPoint.set(item);
    selectedTab.set(1);
  }

  function toggleDarkMode() {
    updatePreferences({ darkMode: !$preferences.darkMode });
  }
</script>

<div class="p-4 pb-20 space-y-6">
  <h2 class="text-xl font-bold text-gray-900 dark:text-white">Preferences</h2>

  <div class="flex items-center justify-between">
    <span class="text-sm font-medium text-gray-700 dark:text-gray-300">Dark Mode</span>
    <button
      onclick={toggleDarkMode}
      class="relative w-12 h-6 rounded-full transition-colors {$preferences.darkMode ? 'bg-blue-600' : 'bg-gray-300'}"
    >
      <span class="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform {$preferences.darkMode ? 'translate-x-6' : ''}"></span>
    </button>
  </div>

  <div class="border-t border-gray-200 dark:border-gray-700 pt-4">
    <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Advanced</h3>

    <div class="flex items-center justify-between">
      <span class="text-sm font-medium text-gray-700 dark:text-gray-300">Show Coordinates Input</span>
      <button
        onclick={() => updatePreferences({ showCoordinates: !$preferences.showCoordinates })}
        class="relative w-12 h-6 rounded-full transition-colors {$preferences.showCoordinates ? 'bg-blue-600' : 'bg-gray-300'}"
      >
        <span class="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform {$preferences.showCoordinates ? 'translate-x-6' : ''}"></span>
      </button>
    </div>
  </div>

  {#if $recentPlacesForCurrentGpx.length > 0}
    <div class="border-t border-gray-200 dark:border-gray-700 pt-4">
      <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Recent Places</h3>
      <ul class="space-y-1 max-h-40 overflow-y-auto">
        {#each $recentPlacesForCurrentGpx as item}
          <li>
            <button onclick={() => selectPlace(item)} class="w-full text-left px-3 py-2 bg-white dark:bg-gray-700 rounded text-xs hover:bg-gray-100 dark:hover:bg-gray-600 truncate text-gray-900 dark:text-gray-100">
              {item.name}
            </button>
          </li>
        {/each}
      </ul>
    </div>
  {/if}

  {#if $historyForCurrentGpx.length > 0}
    <div class="border-t border-gray-200 dark:border-gray-700 pt-4">
      <div class="flex justify-between items-center mb-2">
        <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-300">Route History</h3>
        <button onclick={() => clearHistory()} class="text-xs text-red-600 underline">Clear all</button>
      </div>
      <ul class="space-y-2 max-h-60 overflow-y-auto">
        {#each $historyForCurrentGpx as item}
          <li>
            <button
              onclick={() => selectHistoryItem(item)}
              class="w-full text-left p-3 bg-white dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600"
            >
              <p class="text-xs font-medium truncate text-gray-900 dark:text-gray-100">{item.origin.name} → {item.destination.name}</p>
              <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">{formatDistance(item.distance)}</p>
            </button>
          </li>
        {/each}
      </ul>
    </div>
  {/if}

  <div class="border-t border-gray-200 dark:border-gray-700 pt-4">
    <p class="text-xs text-gray-500">Data stored locally in your browser.</p>
  </div>

  <div class="border-t border-gray-200 dark:border-gray-700 pt-4">
    <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">About</h3>
    <p class="text-xs text-gray-500">Le Douanier {VERSION}</p>
    <p class="text-xs text-gray-400 mt-1">Hiking distance calculator for GR34 & GR20</p>
  </div>
</div>