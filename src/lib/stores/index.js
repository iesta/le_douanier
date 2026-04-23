import { writable, derived } from 'svelte/store';
import { findNearestTrackPointIndex } from '$lib/utils/geo.js';
import { calculateBounds } from '$lib/utils/geocode.js';

const HISTORY_KEY = 'le_douanier_history';
const RECENT_ORIGINS_KEY = 'le_douanier_recent_origins';
const RECENT_DESTS_KEY = 'le_douanier_recent_destinations';
const SELECTED_GPX_KEY = 'le_douanier_selected_gpx';

function loadHistory() {
  if (typeof localStorage === 'undefined') return [];
  try {
    const data = localStorage.getItem(HISTORY_KEY);
    return data ? JSON.parse(data) : [];
  } catch { return []; }
}

function saveHistory(history) {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
}

function loadRecentPlaces(key) {
  if (typeof localStorage === 'undefined') return [];
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  } catch { return []; }
}

function saveRecentPlaces(key, places) {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem(key, JSON.stringify(places));
}

function loadSelectedGpx() {
  if (typeof localStorage === 'undefined') return null;
  return localStorage.getItem(SELECTED_GPX_KEY);
}

function saveSelectedGpx(name) {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem(SELECTED_GPX_KEY, name);
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

export const recentOrigins = writable(loadRecentPlaces(RECENT_ORIGINS_KEY));
export const recentDestinations = writable(loadRecentPlaces(RECENT_DESTS_KEY));

export function addToRecentOrigins(place) {
  recentOrigins.update(items => {
    const filtered = items.filter(i => !(i.lat === place.lat && i.lon === place.lon));
    const updated = [place, ...filtered].slice(0, 10);
    saveRecentPlaces(RECENT_ORIGINS_KEY, updated);
    return updated;
  });
}

export function addToRecentDestinations(place) {
  recentDestinations.update(items => {
    const filtered = items.filter(i => !(i.lat === place.lat && i.lon === place.lon));
    const updated = [place, ...filtered].slice(0, 10);
    saveRecentPlaces(RECENT_DESTS_KEY, updated);
    return updated;
  });
}

export const history = writable(loadHistory());

export function addToHistory(origin, destination, distance) {
  history.update(h => {
    const entry = {
      id: Date.now(),
      origin: { name: origin.name, lat: origin.lat, lon: origin.lon },
      destination: { name: destination.name, lat: destination.lat, lon: destination.lon },
      distance,
      timestamp: new Date().toISOString()
    };
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

export const selectedTab = writable(0);

export const preferences = writable({
  unit: 'km',
  pathColor: '#3388ff',
  pathWidth: 3
});