<script>
  import { originPoint, destinationPoint, trackBounds, history, clearHistory, recentPlacesForCurrentGpx, addToRecentPlaces, selectedTab, preferences } from '$lib/stores/index.js';
  import { searchPlace, searchPOI } from '$lib/utils/geocode.js';

  let originQuery = $state('');
  let originResults = $state([]);
  let originPOIResults = $state([]);
  let originLoading = $state(false);
  let originShowCoords = $state(false);
  let originLat = $state('');
  let originLon = $state('');
  let originShowRecent = $state(false);
  let originSelectedIndex = $state(-1);
  let originBlockSearch = $state(false);

  let destShowRecent = $state(false);
  let destSelectedIndex = $state(-1);
  let destBlockSearch = $state(false);

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

  function handleOriginKeydown(e) {
    if (originResults.length === 0 && $recentPlacesForCurrentGpx.length === 0) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      const max = originResults.length > 0 ? originResults.length - 1 : $recentPlacesForCurrentGpx.length - 1;
      originSelectedIndex = Math.min(originSelectedIndex + 1, max);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      originSelectedIndex = Math.max(originSelectedIndex - 1, 0);
    } else if (e.key === 'Enter' && originSelectedIndex >= 0) {
      e.preventDefault();
      if (originResults.length > 0 && originSelectedIndex < originResults.length) {
        selectOriginPlace(originResults[originSelectedIndex]);
      } else {
        const idx = originSelectedIndex - originResults.length;
        if (idx >= 0 && idx < $recentPlacesForCurrentGpx.length) {
          selectOriginRecent($recentPlacesForCurrentGpx[idx]);
        }
      }
    } else if (e.key === 'Tab') {
      e.preventDefault();
      document.querySelector('#dest-input')?.focus();
    } else if (e.key === 'Escape') {
      originResults = [];
      originSelectedIndex = -1;
    }
  }

  function handleDestKeydown(e) {
    if (destResults.length === 0 && $recentPlacesForCurrentGpx.length === 0) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      const max = destResults.length > 0 ? destResults.length - 1 : $recentPlacesForCurrentGpx.length - 1;
      destSelectedIndex = Math.min(destSelectedIndex + 1, max);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      destSelectedIndex = Math.max(destSelectedIndex - 1, 0);
    } else if (e.key === 'Enter' && destSelectedIndex >= 0) {
      e.preventDefault();
      if (destResults.length > 0 && destSelectedIndex < destResults.length) {
        selectDestPlace(destResults[destSelectedIndex]);
      } else {
        const idx = destSelectedIndex - destResults.length;
        if (idx >= 0 && idx < $recentPlacesForCurrentGpx.length) {
          selectDestRecent($recentPlacesForCurrentGpx[idx]);
        }
      }
    } else if (e.key === 'Tab') {
      e.preventDefault();
      if ($originPoint && $destinationPoint) {
        document.querySelector('button[onclick*="selectedTab.set(2)"]')?.focus();
      }
    } else if (e.key === 'Escape') {
      destResults = [];
      destSelectedIndex = -1;
    }
  }

  async function handleOriginInput() {
    originSelectedIndex = -1;
    clearTimeout(originDebounce);
    originDebounce = setTimeout(async () => {
      if (originQuery.length >= 2) {
        originLoading = true;
        try {
          const results = await searchPlace(originQuery, 10, $trackBounds);
          const seen = new Set();
          originResults = results.filter(p => {
            const key = `${p.lat},${p.lon}`;
            if (seen.has(key)) return false;
            seen.add(key);
            return true;
          });
        } catch (e) {
          originResults = [];
        } finally {
          originLoading = false;
        }
      } else if (originQuery.length === 0 && originShowRecent) {
        // show recent
      } else {
        originResults = [];
      }
    }, 300);
  }

  async function handleDestInput() {
    destSelectedIndex = -1;
    destShowRecent = false;
    clearTimeout(destDebounce);
    destDebounce = setTimeout(async () => {
      if (destQuery.length >= 2) {
        destLoading = true;
        try {
          const results = await searchPlace(destQuery, 10, $trackBounds);
          const seen = new Set();
          destResults = results.filter(p => {
            const key = `${p.lat},${p.lon}`;
            if (seen.has(key)) return false;
            seen.add(key);
            return true;
          });
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
      originPOIResults = originPOIResults.slice(0, 15);
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
      destPOIResults = destPOIResults.slice(0, 15);
    } catch (e) {
      destPOIResults = [];
    } finally {
      destLoading = false;
    }
  }

  function selectOriginPlace(place) {
    originBlockSearch = true;
    const pt = {
      lat: parseFloat(place.lat),
      lon: parseFloat(place.lon),
      name: place.display_name.split(',').slice(0, 3).join(',')
    };
    originPoint.set(pt);
    addToRecentPlaces(pt);
    originQuery = '';
    originResults = [];
    originPOIResults = [];
    originShowRecent = false;
    originSelectedIndex = -1;
    setTimeout(() => { originBlockSearch = false; }, 100);
  }

  function selectDestPlace(place) {
    const pt = {
      lat: parseFloat(place.lat),
      lon: parseFloat(place.lon),
      name: place.display_name.split(',').slice(0, 3).join(',')
    };
    destinationPoint.set(pt);
    addToRecentPlaces(pt);
    destQuery = '';
    destResults = [];
    destPOIResults = [];
    destShowRecent = false;
    destSelectedIndex = -1;
  }

  function selectOriginRecent(place) {
    originPoint.set(place);
    addToRecentPlaces(place);
    originQuery = place.name || '';
    originResults = [];
    originPOIResults = [];
    originShowRecent = false;
    originSelectedIndex = -1;
  }

  function selectDestRecent(place) {
    destinationPoint.set(place);
    addToRecentPlaces(place);
    destQuery = place.name || '';
    destResults = [];
    destPOIResults = [];
    destShowRecent = false;
    destSelectedIndex = -1;
  }

  function onOriginPOIChange(e) {
    const idx = parseInt(e.target.value);
    if (idx >= 0 && originPOIResults[idx]) {
      const poi = originPOIResults[idx];
      const pt = {
        lat: poi.lat,
        lon: poi.lon,
        name: poi.tags?.name || poi.tags?.tourism || poi.tags?.amenity || 'POI'
      };
      originPoint.set(pt);
      addToRecentPlaces(pt);
      originShowRecent = false;
      originPOIResults = [];
    }
  }

  function onDestPOIChange(e) {
    const idx = parseInt(e.target.value);
    if (idx >= 0 && destPOIResults[idx]) {
      const poi = destPOIResults[idx];
      const pt = {
        lat: poi.lat,
        lon: poi.lon,
        name: poi.tags?.name || poi.tags?.tourism || poi.tags?.amenity || 'POI'
      };
      destinationPoint.set(pt);
      addToRecentPlaces(pt);
      destShowRecent = false;
      destPOIResults = [];
    }
  }

  function setOriginCoords() {
    if (originLat && originLon) {
      const pt = {
        lat: parseFloat(originLat),
        lon: parseFloat(originLon),
        name: `Custom (${originLat}, ${originLon})`
      };
      originPoint.set(pt);
      addToRecentPlaces(pt);
      originQuery = '';
      originResults = [];
      originShowRecent = false;
      loadOriginPOIs(parseFloat(originLat), parseFloat(originLon));
    }
  }

  function setDestCoords() {
    if (destLat && destLon) {
      const pt = {
        lat: parseFloat(destLat),
        lon: parseFloat(destLon),
        name: `Custom (${destLat}, ${destLon})`
      };
      destinationPoint.set(pt);
      addToRecentPlaces(pt);
      destQuery = '';
      destResults = [];
      destShowRecent = false;
      loadDestPOIs(parseFloat(destLat), parseFloat(destLon));
    }
  }

  function clearOrigin() {
    originPoint.set(null);
    originLat = '';
    originLon = '';
    originQuery = '';
    originResults = [];
    originPOIResults = [];
    originShowRecent = false;
  }

  function clearDest() {
    destinationPoint.set(null);
    destLat = '';
    destLon = '';
    destQuery = '';
    destResults = [];
    destPOIResults = [];
    destShowRecent = false;
  }

  function toggleOriginRecent() {
    originShowRecent = !originShowRecent;
    if (originShowRecent) {
      originQuery = '';
      originResults = [];
    }
  }

  function toggleDestRecent() {
    destShowRecent = !destShowRecent;
    if (destShowRecent) {
      destQuery = '';
      destResults = [];
    }
  }

  function selectFromHistory(item) {
    originPoint.set(item.origin);
    destinationPoint.set(item.destination);
    addToRecentPlaces(item.origin);
    addToRecentPlaces(item.destination);
    showHistory = false;
  }

  function formatDistance(meters) {
    return (meters / 1000).toFixed(2) + ' km';
  }
</script>

<div class="p-4 pb-20 space-y-4">
  <div class="flex items-center justify-between">
    <h2 class="text-xl font-bold text-gray-900 dark:text-white">Route</h2>
    {#if $history.length > 0}
      <button onclick={() => showHistory = !showHistory} class="text-xs text-blue-600 underline">
        History ({$history.length})
      </button>
    {/if}
  </div>

  {#if showHistory && $history.length > 0}
    <div class="p-3 bg-gray-100 dark:bg-gray-800 rounded-lg">
      <div class="flex justify-between items-center mb-2">
        <h3 class="text-sm font-semibold">Recent Routes</h3>
        <button onclick={() => clearHistory()} class="text-xs text-red-600 underline">Clear all</button>
      </div>
      <ul class="max-h-40 overflow-y-auto divide-y">
        {#each $history as item}
          <li>
            <button onclick={() => selectFromHistory(item)} class="w-full text-left p-2 hover:bg-gray-200 text-xs">
              <p class="font-medium truncate">{item.origin.name} → {item.destination.name}</p>
              <p class="text-gray-500">{formatDistance(item.distance)}</p>
            </button>
          </li>
        {/each}
      </ul>
    </div>
  {/if}

  <div class="space-y-4">
    <div class="p-3 bg-red-50 border border-red-200 rounded-lg">
      <h3 class="font-semibold text-red-800 mb-2">Origin</h3>

      <div class="relative">
        <input
          id="origin-input"
          type="text"
          bind:value={originQuery}
          oninput={handleOriginInput}
          onkeydown={handleOriginKeydown}
          onfocus={() => originQuery.length === 0 && toggleOriginRecent()}
          placeholder="Search origin..."
          class="w-full px-3 py-2 pr-10 border rounded-lg bg-white text-sm"
        />
        {#if originLoading}
          <div class="absolute right-3 top-2">
            <div class="animate-spin h-4 w-4 border-2 border-red-600 rounded-full border-t-transparent"></div>
          </div>
        {/if}
      </div>

      {#if originShowRecent && $recentPlacesForCurrentGpx.length > 0}
        <ul class="mt-2 bg-white border rounded-lg shadow max-h-40 overflow-y-auto">
          {#each $recentPlacesForCurrentGpx as place}
            <li>
              <button onclick={() => selectOriginRecent(place)} class="w-full text-left px-3 py-2 hover:bg-gray-100 text-xs border-b last:border-0">
                <span class="text-gray-400 mr-2">🕐</span>{place.name}
              </button>
            </li>
          {/each}
        </ul>
      {/if}

      {#if originResults.length > 0}
        <ul class="mt-2 bg-white border rounded-lg shadow max-h-40 overflow-y-auto">
          {#each originResults as place, i}
            <li>
              <button
                type="button"
                onclick={() => selectOriginPlace(place)}
                class="w-full text-left px-3 py-2 text-xs border-b last:border-0 {i === originSelectedIndex ? 'bg-blue-100' : 'hover:bg-gray-100'}"
              >
                {place.display_name.split(',').slice(0, 3).join(',')}
              </button>
            </li>
          {/each}
        </ul>
      {/if}

      {#if originPOIResults.length > 0}
        <div class="mt-3">
          <label class="text-xs text-gray-600 block mb-1">Hotels & POIs nearby:</label>
          <select onchange={onOriginPOIChange} class="w-full px-3 py-2 border rounded-lg bg-white text-sm">
            <option value="">-- Select --</option>
            {#each originPOIResults as poi, i}
              <option value={i}>
                {poi.tags?.name || poi.tags?.tourism || 'Unnamed'} ({poi.tags?.tourism || poi.tags?.amenity})
              </option>
            {/each}
          </select>
        </div>
      {/if}

      {#if $preferences.showCoordinates}
        <button onclick={() => originShowCoords = !originShowCoords} class="text-xs text-red-600 underline mt-2 block">
          {originShowCoords ? 'Hide' : 'Show'} coordinates
        </button>

        {#if originShowCoords}
          <div class="mt-2 flex gap-2">
            <input type="number" step="any" bind:value={originLat} placeholder="Lat" class="flex-1 px-2 py-1 border rounded text-sm" />
            <input type="number" step="any" bind:value={originLon} placeholder="Lon" class="flex-1 px-2 py-1 border rounded text-sm" />
            <button onclick={setOriginCoords} disabled={!originLat || !originLon} class="px-3 py-1 bg-red-600 text-white rounded text-sm">Set</button>
          </div>
        {/if}
      {/if}

      {#if $originPoint}
        <div class="mt-2 p-2 bg-green-100 rounded flex justify-between items-center">
          <span class="text-xs font-medium truncate flex-1 mr-2">{$originPoint.name}</span>
          <button onclick={clearOrigin} class="text-red-600 text-xs underline">Clear</button>
        </div>
      {/if}
    </div>

    <div class="p-3 bg-green-50 border border-green-200 rounded-lg">
      <h3 class="font-semibold text-green-800 mb-2">Destination</h3>

      <div class="relative">
        <input
          id="dest-input"
          type="text"
          bind:value={destQuery}
          oninput={handleDestInput}
          onkeydown={handleDestKeydown}
          onfocus={() => destQuery.length === 0 && toggleDestRecent()}
          placeholder="Search destination..."
          class="w-full px-3 py-2 pr-10 border rounded-lg bg-white text-sm"
        />
        {#if destLoading}
          <div class="absolute right-3 top-2">
            <div class="animate-spin h-4 w-4 border-2 border-green-600 rounded-full border-t-transparent"></div>
          </div>
        {/if}
      </div>

      {#if destShowRecent && $recentPlacesForCurrentGpx.length > 0}
        <ul class="mt-2 bg-white border rounded-lg shadow max-h-40 overflow-y-auto">
          {#each $recentPlacesForCurrentGpx as place}
            <li>
              <button onclick={() => selectDestRecent(place)} class="w-full text-left px-3 py-2 hover:bg-gray-100 text-xs border-b last:border-0">
                <span class="text-gray-400 mr-2">🕐</span>{place.name}
              </button>
            </li>
          {/each}
        </ul>
      {/if}

      {#if destResults.length > 0}
        <ul class="mt-2 bg-white border rounded-lg shadow max-h-40 overflow-y-auto">
          {#each destResults as place, i}
            <li>
              <button
                type="button"
                onclick={() => selectDestPlace(place)}
                class="w-full text-left px-3 py-2 text-xs border-b last:border-0 {i === destSelectedIndex ? 'bg-blue-100' : 'hover:bg-gray-100'}"
              >
                {place.display_name.split(',').slice(0, 3).join(',')}
              </button>
            </li>
          {/each}
        </ul>
      {/if}

      {#if destPOIResults.length > 0}
        <div class="mt-3">
          <label class="text-xs text-gray-600 block mb-1">Hotels & POIs nearby:</label>
          <select onchange={onDestPOIChange} class="w-full px-3 py-2 border rounded-lg bg-white text-sm">
            <option value="">-- Select --</option>
            {#each destPOIResults as poi, i}
              <option value={i}>
                {poi.tags?.name || poi.tags?.tourism || 'Unnamed'} ({poi.tags?.tourism || poi.tags?.amenity})
              </option>
            {/each}
          </select>
        </div>
      {/if}

      {#if $preferences.showCoordinates}
        <button onclick={() => destShowCoords = !destShowCoords} class="text-xs text-green-600 underline mt-2 block">
          {destShowCoords ? 'Hide' : 'Show'} coordinates
        </button>

        {#if destShowCoords}
          <div class="mt-2 flex gap-2">
            <input type="number" step="any" bind:value={destLat} placeholder="Lat" class="flex-1 px-2 py-1 border rounded text-sm" />
            <input type="number" step="any" bind:value={destLon} placeholder="Lon" class="flex-1 px-2 py-1 border rounded text-sm" />
            <button onclick={setDestCoords} disabled={!destLat || !destLon} class="px-3 py-1 bg-green-600 text-white rounded text-sm">Set</button>
          </div>
        {/if}
      {/if}

      {#if $destinationPoint}
        <div class="mt-2 p-2 bg-green-100 rounded flex justify-between items-center">
          <span class="text-xs font-medium truncate flex-1 mr-2">{$destinationPoint.name}</span>
          <button onclick={clearDest} class="text-red-600 text-xs underline">Clear</button>
        </div>
      {/if}
    </div>

    {#if $originPoint && $destinationPoint}
      <button
        onclick={() => selectedTab.set(2)}
        class="w-full py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 flex items-center justify-center gap-2"
      >
        <span>View Distance & Info</span>
        <span>→</span>
      </button>
    {/if}
  </div>
</div>