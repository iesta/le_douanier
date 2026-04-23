<script>
  import { selectedTab } from '$lib/stores/index.js';

  const tabs = [
    { name: 'Origin', icon: 'start' },
    { name: 'Destination', icon: 'end' },
    { name: 'Distance', icon: 'distance' },
    { name: 'Map', icon: 'map' },
    { name: 'Preferences', icon: 'settings' }
  ];

  const icons = {
    start: `<path d="M12 2L8 6h3v6H8l4 4 4-4H9V6h3L12 2z"/>`,
    end: `<path d="M12 22l4-4h-3V12h3l-4-4-4 4h3v6H8l4 4z"/>`,
    distance: `<path d="M3 12h18M3 6h18M3 18h18" stroke="currentColor" stroke-width="2" fill="none"/>`,
    map: `<path d="M3 6l6-3 6 3 6-3v15l-6 3-6-3-6 3V6z" fill="none" stroke="currentColor" stroke-width="2"/>`,
    settings: `<path d="M12 15a3 3 0 100-6 3 3 0 000 6z"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 01-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09a1.65 1.65 0 00-1.08-1.51 1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09a1.65 1.65 0 001.51-1.08 1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 112.83-2.83l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 114 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 112.83 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1.08z" fill="none" stroke="currentColor" stroke-width="2"/>`
  };
</script>

<nav class="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 flex z-50">
  {#each tabs as tab, i}
    <button
      onclick={() => selectedTab.set(i)}
      class="flex-1 py-3 flex flex-col items-center justify-center transition-colors {$selectedTab === i
        ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20'
        : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'}"
    >
      <svg
        class="w-6 h-6 mb-1"
        viewBox="0 0 24 24"
        fill="currentColor"
        xmlns="http://www.w3.org/2000/svg"
      >
        {@html icons[tab.icon]}
      </svg>
      <span class="text-xs font-medium">{tab.name}</span>
    </button>
  {/each}
</nav>