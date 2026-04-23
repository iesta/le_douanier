<script>
  import { originPoint, destinationPoint, trackBounds, history, clearHistory } from '$lib/stores/index.js';
  import { searchPlace, searchPOI } from '$lib/utils/geocode.js';

  let originQuery = $state('');
  let originResults = $state([]);
  let originPOIResults = $state([]);
  let originLoading = $state(false);
  let originShowCoords = $state(false);
  let originLat = $state('');
  let originLon = $state('');

  let destQuery = $state('');
  let destResults = $state([]);
  let destPOIResults = $state([]);
  let destLoading = $state(false);
  let destShowCoords = $state(false);
  let destLat = $state('');
  let destLon = $state('');

  let showHistory = $state(false);

  let originDebounce;
  let destDebounce;

  async function handleOriginInput() {
    clearTimeout(originDebounce);
    originDebounce = setTimeout(async () => {
      if (originQuery.length >= 2) {
        originLoading = true;
        try {
          originResults = await searchPlace(originQuery, 10, $trackBounds);
        } catch (e) {
          originResults = [];
        } finally {
          originLoading = false;
        }
      } else {
        originResults = [];
      }
    }, 300);
  }

  async function handleDestInput() {
    clearTimeout(destDebounce);
    destDebounce = setTimeout(async () => {
      if (destQuery.length >= 2) {
        destLoading = true;
        try {
          destResults = await searchPlace(destQuery, 10, $trackBounds);
        } catch (e) {
          destResults = [];
        } finally {
          destLoading = false;
        }
      } else {
        destResults = [];
      }
    }, 300);
  }

  async function loadOriginPOIs(lat, lon) {
    originLoading = true;
    try {
      originPOIResults = await searchPOI(lat, lon, 50000);
      originPOIResults = originPOIResults.slice(0, 10);
    } catch (e) {
      originPOIResults = [];
    } finally {
      originLoading = false;
    }
  }

  async function loadDestPOIs(lat, lon) {
    destLoading = true;
    try {
      destPOIResults = await searchPOI(lat, lon, 50000);
      destPOIResults = destPOIResults.slice(0, 10);
    } catch (e) {
      destPOIResults = [];
    } finally {
      destLoading = false;
    }
  }

  function selectOriginPlace(place) {
    originPoint.set({
      lat: parseFloat(place.lat),
      lon: parseFloat(place.lon),
      name: place.display_name.split(',').slice(0, 3).join(',')
    });
    originQuery = '';
    originResults = [];
    loadOriginPOIs(parseFloat(place.lat), parseFloat(place.lon));
  }

  function selectDestPlace(place) {
    destinationPoint.set({
      lat: parseFloat(place.lat),
      lon: parseFloat(place.lon),
      name: place.display_name.split(',').slice(0, 3).join(',')
    });
    destQuery = '';
    destResults = [];
    loadDestPOIs(parseFloat(place.lat), parseFloat(place.lon));
  }

  function selectOriginPOI(poi) {
    originPoint.set({
      lat: poi.lat,
      lon: poi.lon,
      name: poi.tags?.name || poi.tags?.tourism || poi.tags?.amenity || 'POI'
    });
    originPOIResults = [];
  }

  function selectDestPOI(poi) {
    destinationPoint.set({
      lat: poi.lat,
      lon: poi.lon,
      name: poi.tags?.name || poi.tags?.tourism || poi.tags?.amenity || 'POI'
    });
    destPOIResults = [];
  }

  function setOriginCoords() {
    if (originLat && originLon) {
      originPoint.set({
        lat: parseFloat(originLat),
        lon: parseFloat(originLon),
        name: `Custom (${originLat}, ${originLon})`
      });
    }
  }

  function setDestCoords() {
    if (destLat && destLon) {
      destinationPoint.set({
        lat: parseFloat(destLat),
        lon: parseFloat(destLon),
        name: `Custom (${destLat}, ${destLon})`
      });
    }
  }

  function clearOrigin() {
    originPoint.set(null);
    originLat = '';
    originLon = '';
    originQuery = '';
    originResults = [];
    originPOIResults = [];
  }

  function clearDest() {
    destinationPoint.set(null);
    destLat = '';
    destLon = '';
    destQuery = '';
    destResults = [];
    destPOIResults = [];
  }

  function selectFromHistory(item) {
    originPoint.set(item.origin);
    destinationPoint.set(item.destination);
    showHistory = false;
  }

  function formatDistance(meters) {
    return (meters / 1000).toFixed(2) + ' km';
  }
</script>

<div class="p-4 pb-20 space-y-6">
  <div class="flex items-center justify-between">
    <h2 class="text-xl font-bold text-gray-900 dark:text-white">Route</h2>
    {#if $history.length > 0}
      <button
        onclick={() => showHistory = !showHistory}
        class="text-xs text-blue-600 dark:text-blue-400 underline"
      >
        History ({$history.length})
      </button>
    {/if}
  </div>

  {#if showHistory && $history.length > 0}
    <div class="p-3 bg-gray-100 dark:bg-gray-800 rounded-lg">
      <div class="flex justify-between items-center mb-2">
        <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-300">Recent Routes</h3>
        <button onclick={() => clearHistory()} class="text-xs text-red-600 underline">Clear all</button>
      </div>
      <ul class="max-h-48 overflow-y-auto divide-y divide-gray-200 dark:divide-gray-700">
        {#each $history as item}
          <li>
            <button
              onclick={() => selectFromHistory(item)}
              class="w-full text-left p-2 hover:bg-gray-200 dark:hover:bg-gray-700 text-xs"
            >
              <p class="font-medium text-gray-800 dark:text-gray-200 truncate">
                {item.origin.name || 'Origin'} → {item.destination.name || 'Destination'}
              </p>
              <p class="text-gray-500">{formatDistance(item.distance)}</p>
            </button>
          </li>
        {/each}
      </ul>
    </div>
  {/if}

  <div class="space-y-4">
    <div class="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
      <h3 class="font-semibold text-red-800 dark:text-red-200 mb-2">Origin</h3>

      <div class="relative">
        <input
          type="text"
          bind:value={originQuery}
          oninput={handleOriginInput}
          placeholder="Search origin..."
          class="w-full px-3 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
        />
        {#if originLoading}
          <div class="absolute right-3 top-2">
            <div class="animate-spin h-4 w-4 border-2 border-red-600 rounded-full border-t-transparent"></div>
          </div>
        {/if}
      </div>

      {#if originResults.length > 0}
        <ul class="mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-40 overflow-y-auto">
          {#each originResults as place}
            <li>
              <button
                onclick={() => selectOriginPlace(place)}
                class="w-full text-left px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-900 dark:text-white text-xs border-b border-gray-100 dark:border-gray-700 last:border-0"
              >
                {place.display_name.split(',').slice(0, 3).join(',')}
              </button>
            </li>
          {/each}
        </ul>
      {/if}

      {#if originPOIResults.length > 0}
        <div class="mt-2">
          <p class="text-xs text-gray-500 dark:text-gray-400 mb-1">Hotels/POIs nearby:</p>
          <ul class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg max-h-32 overflow-y-auto">
            {#each originPOIResults as poi}
              <li>
                <button
                  onclick={() => selectOriginPOI(poi)}
                  class="w-full text-left px-2 py-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-900 dark:text-white text-xs flex justify-between"
                >
                  <span>{poi.tags?.name || poi.tags?.tourism || poi.tags?.amenity || 'Unnamed'}</span>
                  <span class="text-gray-500">{poi.tags?.tourism || poi.tags?.amenity || ''}</span>
                </button>
              </li>
            {/each}
          </ul>
        </div>
      {/if}

      <button
        onclick={() => originShowCoords = !originShowCoords}
        class="text-xs text-red-600 dark:text-red-400 underline mt-2"
      >
        {originShowCoords ? 'Hide' : 'Show'} coordinates
      </button>

      {#if originShowCoords}
        <div class="mt-2 space-y-2">
          <input type="number" step="any" bind:value={originLat} placeholder="Lat" class="w-1/2 px-2 py-1 border rounded text-sm" />
          <input type="number" step="any" bind:value={originLon} placeholder="Lon" class="w-1/2 px-2 py-1 border rounded text-sm" />
          <button onclick={setOriginCoords} disabled={!originLat || !originLon} class="px-2 py-1 bg-red-600 text-white rounded text-xs">Set</button>
        </div>
      {/if}

      {#if $originPoint}
        <div class="mt-2 p-2 bg-green-100 dark:bg-green-900/40 rounded text-xs">
          <span class="font-medium text-green-800 dark:text-green-200">
            {$originPoint.name || `Lat: ${$originPoint.lat.toFixed(4)}, Lon: ${$originPoint.lon.toFixed(4)}`}
          </span>
          <button onclick={clearOrigin} class="ml-2 text-red-600 underline">Clear</button>
        </div>
      {/if}
    </div>

    <div class="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
      <h3 class="font-semibold text-green-800 dark:text-green-200 mb-2">Destination</h3>

      <div class="relative">
        <input
          type="text"
          bind:value={destQuery}
          oninput={handleDestInput}
          placeholder="Search destination..."
          class="w-full px-3 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
        />
        {#if destLoading}
          <div class="absolute right-3 top-2">
            <div class="animate-spin h-4 w-4 border-2 border-green-600 rounded-full border-t-transparent"></div>
          </div>
        {/if}
      </div>

      {#if destResults.length > 0}
        <ul class="mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-40 overflow-y-auto">
          {#each destResults as place}
            <li>
              <button
                onclick={() => selectDestPlace(place)}
                class="w-full text-left px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-900 dark:text-white text-xs border-b border-gray-100 dark:border-gray-700 last:border-0"
              >
                {destResults.display_name?.split(',').slice(0, 3).join(',') || place.display_name.split(',').slice(0, 3).join(',')}
              </button>
            </li>
          {/each}
        </ul>
      {/if}

      {#if destPOIResults.length > 0}
        <div class="mt-2">
          <p class="text-xs text-gray-500 dark:text-gray-400 mb-1">Hotels/POIs nearby:</p>
          <ul class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg max-h-32 overflow-y-auto">
            {#each destPOIResults as poi}
              <li>
                <button
                  onclick={() => selectDestPOI(poi)}
                  class="w-full text-left px-2 py-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-900 dark:text-white text-xs flex justify-between"
                >
                  <span>{poi.tags?.name || poi.tags?.tourism || poi.tags?.amenity || 'Unnamed'}</span>
                  <span class="text-gray-500">{poi.tags?.tourism || poi.tags?.amenity || ''}</span>
                </button>
              </li>
            {/each}
          </ul>
        </div>
      {/if}

      <button
        onclick={() => destShowCoords = !destShowCoords}
        class="text-xs text-green-600 dark:text-green-400 underline mt-2"
      >
        {destShowCoords ? 'Hide' : 'Show'} coordinates
      </button>

      {#if destShowCoords}
        <div class="mt-2 space-y-2">
          <input type="number" step="any" bind:value={destLat} placeholder="Lat" class="w-1/2 px-2 py-1 border rounded text-sm" />
          <input type="number" step="any" bind:value={destLon} placeholder="Lon" class="w-1/2 px-2 py-1 border rounded text-sm" />
          <button onclick={setDestCoords} disabled={!destLat || !destLon} class="px-2 py-1 bg-green-600 text-white rounded text-xs">Set</button>
        </div>
      {/if}

      {#if $destinationPoint}
        <div class="mt-2 p-2 bg-green-100 dark:bg-green-900/40 rounded text-xs">
          <span class="font-medium text-green-800 dark:text-green-200">
            {$destinationPoint.name || `Lat: ${$destinationPoint.lat.toFixed(4)}, Lon: ${$destinationPoint.lon.toFixed(4)}`}
          </span>
          <button onclick={clearDest} class="ml-2 text-red-600 underline">Clear</button>
        </div>
      {/if}
    </div>
  </div>
</div>