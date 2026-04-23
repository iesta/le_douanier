<script>
  import { selectedTab } from '$lib/stores/index.js';

  const tabs = [
    { name: 'Trails', icon: 'trail' },
    { name: 'Route', icon: 'route' },
    { name: 'Distance', icon: 'distance' },
    { name: 'Map', icon: 'map' },
    { name: 'Prefs', icon: 'settings' }
  ];

  const icons = {
    trail: `<path d="M4 20L8 14L12 16L16 10L20 6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><circle cx="4" cy="20" r="2" fill="currentColor"/><circle cx="20" cy="6" r="2" fill="currentColor"/>`,
    route: `<path d="M9 3L5 7h4v5H5l4 4 4-4h-4V7h4L9 3z" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M15 21l4-4h-4v-5h4l-4-4-4 4h4v5l4 4z" fill="none" stroke="currentColor" stroke-width="1.5"/>`,
    distance: `<circle cx="12" cy="12" r="3" fill="none" stroke="currentColor" stroke-width="2"/><path d="M12 2v4M12 18v4M2 12h4M18 12h4" stroke="currentColor" stroke-width="2"/>`,
    map: `<path d="M3 6l6-3 6 3 6-3v15l-6 3-6-3-6 3V6z" fill="none" stroke="currentColor" stroke-width="2"/><path d="M9 3v15M15 6v15" stroke="currentColor" stroke-width="2"/>`,
    settings: `<circle cx="12" cy="12" r="3" fill="none" stroke="currentColor" stroke-width="2"/><path d="M12 1v4M12 19v4M4.2 4.2l2.8 2.8M17 17l2.8 2.8M1 12h4M19 12h4M4.2 19.8l2.8-2.8M17 7l2.8-2.8" stroke="currentColor" stroke-width="2"/>`
  };
</script>

<nav class="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex z-50">
  {#each tabs as tab, i}
    <button
      onclick={() => selectedTab.set(i)}
      class="flex-1 py-3 flex flex-col items-center justify-center transition-colors {$selectedTab === i
        ? 'text-blue-600 bg-blue-50'
        : 'text-gray-500 hover:text-gray-700'}"
    >
      <svg class="w-5 h-5 mb-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        {@html icons[tab.icon]}
      </svg>
      <span class="text-[10px] font-medium">{tab.name}</span>
    </button>
  {/each}
</nav>