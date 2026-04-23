<script>
  import { destinationPoint } from '$lib/stores/index.js';
  import { searchPlace, searchPOI } from '$lib/utils/geocode.js';

  let query = $state('');
  let results = $state([]);
  let poiResults = $state([]);
  let loading = $state(false);
  let showCoords = $state(false);
  let lat = $state('');
  let lon = $state('');

  let debounceTimer;

  function handleInput() {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(async () => {
      if (query.length >= 2) {
        loading = true;
        try {
          results = await searchPlace(query);
        } catch (e) {
          console.error(e);
          results = [];
        } finally {
          loading = false;
        }
      } else {
        results = [];
      }
    }, 300);
  }

  async function loadPOIs(lat, lon) {
    loading = true;
    try {
      poiResults = await searchPOI(lat, lon, 50000);
      poiResults = poiResults.slice(0, 10);
    } catch (e) {
      console.error(e);
      poiResults = [];
    } finally {
      loading = false;
    }
  }

  function selectPlace(place) {
    destinationPoint.set({
      lat: parseFloat(place.lat),
      lon: parseFloat(place.lon),
      name: place.display_name.split(',').slice(0, 3).join(',')
    });
    query = '';
    results = [];
    loadPOIs(parseFloat(place.lat), parseFloat(place.lon));
  }

  function selectPOI(poi) {
    destinationPoint.set({
      lat: poi.lat,
      lon: poi.lon,
      name: poi.tags?.name || poi.tags?.tourism || poi.tags?.amenity || 'POI'
    });
    poiResults = [];
  }

  function setDestination() {
    if (lat && lon) {
      destinationPoint.set({
        lat: parseFloat(lat),
        lon: parseFloat(lon),
        name: `Custom (${lat}, ${lon})`
      });
    }
  }

  function clearDestination() {
    destinationPoint.set(null);
    lat = '';
    lon = '';
    query = '';
    results = [];
    poiResults = [];
  }

  function toggleCoords() {
    showCoords = !showCoords;
  }
</script>

<div class="p-4 pb-20">
  <div class="flex items-center justify-between mb-4">
    <h2 class="text-xl font-bold text-gray-900 dark:text-white">Destination</h2>
    <button
      onclick={toggleCoords}
      class="text-xs text-blue-600 dark:text-blue-400 underline"
    >
      {showCoords ? 'Hide' : 'Show'} coordinates
    </button>
  </div>

  <div class="relative">
    <input
      type="text"
      bind:value={query}
      oninput={handleInput}
      placeholder="Search place, hotel, restaurant..."
      class="w-full px-3 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
    />
    {#if loading}
      <div class="absolute right-3 top-2.5">
        <div class="animate-spin h-4 w-4 border-2 border-blue-600 rounded-full"></div>
      </div>
    {/if}
  </div>

  {#if results.length > 0}
    <ul class="mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-60 overflow-y-auto">
      {#each results as place}
        <li>
          <button
            onclick={() => selectPlace(place)}
            class="w-full text-left px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-900 dark:text-white text-sm border-b border-gray-100 dark:border-gray-700 last:border-0"
          >
            {place.display_name.split(',').slice(0, 3).join(',')}
          </button>
        </li>
      {/each}
    </ul>
  {/if}

  {#if poiResults.length > 0}
    <div class="mt-4">
      <p class="text-xs text-gray-500 dark:text-gray-400 mb-2">Hotels/POIs within 50km:</p>
      <ul class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-48 overflow-y-auto">
        {#each poiResults as poi}
          <li>
            <button
              onclick={() => selectPOI(poi)}
              class="w-full text-left px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-900 dark:text-white text-sm border-b border-gray-100 dark:border-gray-700 last:border-0 flex justify-between"
            >
              <span>{poi.tags?.name || poi.tags?.tourism || poi.tags?.amenity || 'Unnamed'}</span>
              <span class="text-xs text-gray-500">
                {poi.tags?.tourism || poi.tags?.amenity || ''}
              </span>
            </button>
          </li>
        {/each}
      </ul>
    </div>
  {/if}

  {#if showCoords}
    <div class="mt-4 space-y-3">
      <div>
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Latitude</label>
        <input
          type="number"
          step="any"
          bind:value={lat}
          placeholder="e.g., 48.634700"
          class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
        />
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Longitude</label>
        <input
          type="number"
          step="any"
          bind:value={lon}
          placeholder="e.g., -1.511580"
          class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
        />
      </div>

      <div class="flex gap-2">
        <button
          onclick={setDestination}
          disabled={!lat || !lon}
          class="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-50 hover:bg-blue-700"
        >
          Set Destination
        </button>
        <button
          onclick={clearDestination}
          class="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600"
        >
          Clear
        </button>
      </div>
    </div>
  {/if}

  {#if $destinationPoint}
    <div class="mt-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
      <p class="text-sm font-medium text-green-800 dark:text-green-200">Destination Set</p>
      <p class="text-xs text-green-600 dark:text-green-400 mt-1">
        {$destinationPoint.name || `Lat: ${$destinationPoint.lat.toFixed(6)}, Lon: ${$destinationPoint.lon.toFixed(6)}`}
      </p>
    </div>
  {/if}
</div>