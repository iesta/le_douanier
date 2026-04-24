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
    <p class="text-xs text-gray-400">Hiking distance calculator for GR34 & GR20</p>
    <a href="https://github.com/iesta/le_douanier" target="_blank" rel="noopener" class="text-xs text-gray-600 hover:text-gray-800 mt-1 block" aria-label="GitHub">
      <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>
    </a>
  </div>
</div>