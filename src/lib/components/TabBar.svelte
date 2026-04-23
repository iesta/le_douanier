<script>
  import { selectedTab } from '$lib/stores/index.js';

  const tabs = [
    { name: 'Route', icon: 'route' },
    { name: 'Distance', icon: 'distance' },
    { name: 'Map', icon: 'map' },
    { name: 'Preferences', icon: 'settings' }
  ];

  const icons = {
    route: `<path d="M9 3L5 7h4v5H5l4 4 4-4h-4V7h4L9 3zM15 21l4-4h-4v-5h4l-4-4-4 4h4v5l4 4z" fill="none" stroke="currentColor" stroke-width="1.5"/>`,
    distance: `<circle cx="12" cy="12" r="3" fill="none" stroke="currentColor" stroke-width="2"/><path d="M12 2v4M12 18v4M2 12h4M18 12h4" stroke="currentColor" stroke-width="2"/>`,
    map: `<path d="M3 6l6-3 6 3 6-3v15l-6 3-6-3-6 3V6z" fill="none" stroke="currentColor" stroke-width="2"/><path d="M9 3v15M15 6v15" stroke="currentColor" stroke-width="2"/>`,
    settings: `<path d="M12 15a3 3 0 100-6 3 3 0 000 6z"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 11-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 11-4 0v-.09a1.65 1.65 0 00-1.08-1.51 1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 11-2.83-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09a1.65 1.65 0 001.51-1.08 1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 112.83-2.83l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 114 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 112.83 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1.08z" fill="none" stroke="currentColor" stroke-width="2"/>`
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