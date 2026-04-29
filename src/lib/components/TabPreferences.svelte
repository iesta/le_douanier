<script>
  import { preferences, recentPlacesForCurrentGpx, historyForCurrentGpx, clearHistory, originPoint, destinationPoint, addToRecentPlaces, selectedTab, updatePreferences, exportAppState, importAppState } from '$lib/stores/index.js';
  import { VERSION } from '$lib/version.js';

  let importFileInput = $state(null);
  let showImportConfirm = $state(false);
  let pendingImportData = $state(null);

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

  function exportState() {
    const state = exportAppState();
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const date = new Date().toISOString().split('T')[0];
    a.download = `le-douanier-state-${date}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function triggerImport() {
    importFileInput?.click();
  }

  function handleFileSelect(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target.result);
        if (data.history || data.recentPlaces || data.selectedGpx) {
          pendingImportData = data;
          showImportConfirm = true;
        } else {
          alert('Invalid state file: missing required data');
        }
      } catch {
        alert('Failed to parse state file');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  }

  function confirmImport() {
    if (pendingImportData) {
      importAppState(pendingImportData);
      pendingImportData = null;
      showImportConfirm = false;
      alert('State imported successfully. You may need to reload the GPX file if it changed.');
    }
  }

  function cancelImport() {
    pendingImportData = null;
    showImportConfirm = false;
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
    <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Data Storage</h3>
    <div class="flex gap-2">
      <button
        onclick={exportState}
        class="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
        </svg>
        Export
      </button>
      <button
        onclick={triggerImport}
        class="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/>
        </svg>
        Import
      </button>
    </div>
    <input
      bind:this={importFileInput}
      type="file"
      accept=".json"
      onchange={handleFileSelect}
      class="hidden"
    />
  </div>

  <div class="border-t border-gray-200 dark:border-gray-700 pt-4">
    <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">About</h3>
    <p class="text-xs text-gray-500">Le Douanier {VERSION}</p>
    <p class="text-xs text-gray-400">Hiking distance calculator for GR and any GPX</p>
    <a href="https://github.com/iesta/le_douanier" target="_blank" rel="noopener" class="text-white hover:text-gray-300 mt-1 block" aria-label="GitHub">
      <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>
    </a>
  </div>

  {#if showImportConfirm}
    <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div class="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-sm mx-4 shadow-xl">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">Import State?</h3>
        <p class="text-sm text-gray-600 dark:text-gray-400 mb-4">
          This will replace your current recent places, route history, and preferences with the imported data.
        </p>
        <div class="flex gap-2 justify-end">
          <button
            onclick={cancelImport}
            class="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
          >
            Cancel
          </button>
          <button
            onclick={confirmImport}
            class="px-4 py-2 text-sm bg-green-600 text-white rounded hover:bg-green-700"
          >
            Import
          </button>
        </div>
      </div>
    </div>
  {/if}
</div>