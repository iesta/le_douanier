<script>
  import { preferences } from '$lib/stores/index.js';

  function setUnit(unit) {
    preferences.update(p => ({ ...p, unit }));
  }
</script>

<div class="p-4 pb-20">
  <h2 class="text-xl font-bold mb-4 text-gray-900 dark:text-white">Preferences</h2>

  <div class="space-y-6">
    <div>
      <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Distance Unit</label>
      <div class="flex gap-2">
        <button
          onclick={() => setUnit('km')}
          class="flex-1 px-4 py-2 rounded-lg transition-colors {$preferences.unit === 'km'
            ? 'bg-blue-600 text-white'
            : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'}"
        >
          Kilometers
        </button>
        <button
          onclick={() => setUnit('mi')}
          class="flex-1 px-4 py-2 rounded-lg transition-colors {$preferences.unit === 'mi'
            ? 'bg-blue-600 text-white'
            : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'}"
        >
          Miles
        </button>
      </div>
    </div>

    <div class="pt-4 border-t border-gray-200 dark:border-gray-700">
      <p class="text-sm text-gray-500 dark:text-gray-400">More preferences coming soon...</p>
    </div>
  </div>
</div>