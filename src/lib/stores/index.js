import { writable, derived } from 'svelte/store';
import { findNearestTrackPointIndex } from '$lib/utils/geo.js';
import { calculateBounds } from '$lib/utils/geocode.js';

const HISTORY_KEY = 'le_douanier_history';
const RECENT_PLACES_KEY = 'le_douanier_recent_places';
const SELECTED_GPX_KEY = 'le_douanier_selected_gpx';

function isLocalStorageAvailable() {
  try {
    return typeof localStorage !== 'undefined' && localStorage !== null && typeof localStorage.getItem === 'function';
  } catch {
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
  return localStorage.getItem(SELECTED_GPX_KEY);
}

function saveSelectedGpx(name) {
  if (!isLocalStorageAvailable()) return;
  localStorage.setItem(SELECTED_GPX_KEY, name);
}

function loadPreferences() {
  if (!isLocalStorageAvailable()) return { unit: 'km', darkMode: true, showCoordinates: false };
  try {
    const data = localStorage.getItem('le_douanier_preferences');
    return data ? { unit: 'km', darkMode: true, showCoordinates: false, ...JSON.parse(data) } : { unit: 'km', darkMode: true, showCoordinates: false };
  } catch { return { unit: 'km', darkMode: true, showCoordinates: false }; }
}

function savePreferences(prefs) {
  if (!isLocalStorageAvailable()) return;
  localStorage.setItem('le_douanier_preferences', JSON.stringify(prefs));
}

export const availableGPX = writable([
  { name: 'GR34 Sentier des Douaniers (Brittany)', file: 'gr34-sentier-des-douaniers-2020.gpx', distance: '~2090km' },
  { name: 'GR20 Corsica (North-South)', file: 'gr20-2018-complete-northsouth.gpx', distance: '~180km' }
]);

export const selectedGpx = writable(loadSelectedGpx() || 'gr34-sentier-des-douaniers-2020.gpx');
export const trackPoints = writable([]);
export const trackName = writable('');

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
  recentPlaces.update(items => {
    const filtered = items.filter(i => !(i.lat === place.lat && i.lon === place.lon && i.gpx === $selectedGpx));
    const updated = [{ ...place, gpx: $selectedGpx }, ...filtered].slice(0, 20);
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
  history.update(h => {
    const entry = {
      id: Date.now(),
      gpx: $selectedGpx,
      origin: { name: origin.name, lat: origin.lat, lon: origin.lon },
      destination: { name: destination.name, lat: destination.lat, lon: destination.lon },
      distance,
      timestamp: new Date().toISOString()
    };
    const exists = h.some(item =>
      item.origin.lat === origin.lat && item.origin.lon === origin.lon &&
      item.destination.lat === destination.lat && item.destination.lon === destination.lon &&
      item.gpx === $selectedGpx
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

export const preferences = writable(loadPreferences());

export function updatePreferences(updates) {
  preferences.update(p => {
    const newPrefs = { ...p, ...updates };
    savePreferences(newPrefs);
    return newPrefs;
  });
}