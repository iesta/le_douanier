import { writable, derived, get } from 'svelte/store';
import { findNearestTrackPointIndex } from '$lib/utils/geo.js';
import { calculateBounds } from '$lib/utils/geocode.js';

const HISTORY_KEY = 'le_douanier_history';
const RECENT_PLACES_KEY = 'le_douanier_recent_places';
const SELECTED_GPX_KEY = 'le_douanier_selected_gpx';
const TILE_PROVIDER_KEY = 'le_douanier_tile_provider';

function isLocalStorageAvailable() {
  if (typeof window === 'undefined') return false;
  try {
    if (!window.localStorage) return false;
    const test = '__storage_test__';
    window.localStorage.setItem(test, test);
    window.localStorage.removeItem(test);
    return true;
  } catch (e) {
    return false;
  }
}

function loadHistory() {
  if (!isLocalStorageAvailable()) return [];
  try {
    const data = localStorage.getItem(HISTORY_KEY);
    const parsed = data ? JSON.parse(data) : [];
    return parsed.filter(h => !(h.origin.lat === h.destination.lat && h.origin.lon === h.destination.lon));
  } catch { return []; }
}

function saveHistory(history) {
  if (!isLocalStorageAvailable()) return;
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
}

function loadRecentPlaces() {
  if (!isLocalStorageAvailable()) return [];
  try {
    const data = localStorage.getItem(RECENT_PLACES_KEY);
    return data ? JSON.parse(data) : [];
  } catch { return []; }
}

function saveRecentPlaces(places) {
  if (!isLocalStorageAvailable()) return;
  localStorage.setItem(RECENT_PLACES_KEY, JSON.stringify(places));
}

function loadSelectedGpx() {
  if (!isLocalStorageAvailable()) return null;
  try {
    return localStorage.getItem(SELECTED_GPX_KEY);
  } catch { return null; }
}

function saveSelectedGpx(name) {
  if (!isLocalStorageAvailable()) return;
  localStorage.setItem(SELECTED_GPX_KEY, name);
}

function loadTileProvider() {
  if (!isLocalStorageAvailable()) return 'OpenStreetMap';
  try {
    return localStorage.getItem(TILE_PROVIDER_KEY) || 'OpenStreetMap';
  } catch { return 'OpenStreetMap'; }
}

function saveTileProvider(provider) {
  if (!isLocalStorageAvailable()) return;
  localStorage.setItem(TILE_PROVIDER_KEY, provider);
}

export const availableGPX = writable([
  { name: 'GR34 Sentier des Douaniers (Brittany)', file: 'gr34-sentier-des-douaniers-2020.gpx', distance: '~2090km' },
  { name: 'GR20 Corsica (North-South)', file: 'gr20-2018-complete-northsouth.gpx', distance: '~180km' },
  { name: 'Mare e Monti (Corsica)', file: 'mare-e-monti.gpx', distance: '~200km' }
]);

export const selectedGpx = writable(loadSelectedGpx() || 'gr34-sentier-des-douaniers-2020.gpx');
export const trackPoints = writable([]);
export const trackName = writable('');

selectedGpx.subscribe(gpx => {
  saveSelectedGpx(gpx);
});

export const trackBounds = derived(trackPoints, ($trackPoints) => {
  return calculateBounds($trackPoints, 100);
});

export const originPoint = writable(null);
export const destinationPoint = writable(null);

export const recentPlaces = writable(loadRecentPlaces());

export const recentPlacesForCurrentGpx = derived(
  [recentPlaces, selectedGpx],
  ([$recentPlaces, $selectedGpx]) => {
    return $recentPlaces.filter(p => p.gpx === $selectedGpx);
  }
);

export function addToRecentPlaces(place) {
  const gpx = get(selectedGpx);
  recentPlaces.update(items => {
    const filtered = items.filter(i => !(i.lat === place.lat && i.lon === place.lon && i.gpx === gpx));
    const updated = [{ ...place, gpx }, ...filtered].slice(0, 20);
    saveRecentPlaces(updated);
    return updated;
  });
}

export const history = writable(loadHistory());

export const historyForCurrentGpx = derived(
  [history, selectedGpx],
  ([$history, $selectedGpx]) => {
    return $history.filter(h => h.gpx === $selectedGpx);
  }
);

export function addToHistory(origin, destination, distance) {
  if (origin.lat === destination.lat && origin.lon === destination.lon) return;
  const gpx = get(selectedGpx);
  history.update(h => {
    const entry = {
      id: Date.now(),
      gpx,
      origin: { name: origin.name, lat: origin.lat, lon: origin.lon },
      destination: { name: destination.name, lat: destination.lat, lon: destination.lon },
      distance,
      timestamp: new Date().toISOString()
    };
    const exists = h.some(item =>
      item.origin.lat === origin.lat && item.origin.lon === origin.lon &&
      item.destination.lat === destination.lat && item.destination.lon === destination.lon &&
      item.gpx === gpx
    );
    if (exists) return h;
    const updated = [entry, ...h].slice(0, 20);
    saveHistory(updated);
    return updated;
  });
}

export function clearHistory() {
  history.set([]);
  saveHistory([]);
}

export const originNearestTrackPoint = derived(
  [trackPoints, originPoint],
  ([$trackPoints, $originPoint]) => {
    if (!$originPoint || $trackPoints.length === 0) return null;
    const result = findNearestTrackPointIndex($originPoint.lat, $originPoint.lon, $trackPoints);
    const pt = $trackPoints[result.index];
    return { ...pt, distanceToUser: result.distance };
  }
);

export const destinationNearestTrackPoint = derived(
  [trackPoints, destinationPoint],
  ([$trackPoints, $destinationPoint]) => {
    if (!$destinationPoint || $trackPoints.length === 0) return null;
    const result = findNearestTrackPointIndex($destinationPoint.lat, $destinationPoint.lon, $trackPoints);
    const pt = $trackPoints[result.index];
    return { ...pt, distanceToUser: result.distance };
  }
);

export const selectedTab = writable(1);

export const tileProvider = writable(loadTileProvider());

tileProvider.subscribe(provider => {
  saveTileProvider(provider);
});

export const preferences = writable({ unit: 'km', darkMode: true, showCoordinates: false });

export function updatePreferences(updates) {
  preferences.update(p => ({ ...p, ...updates }));
}
