import { writable, derived } from 'svelte/store';
import { findNearestTrackPointIndex } from '$lib/utils/geo.js';
import { calculateBounds } from '$lib/utils/geocode.js';

const HISTORY_KEY = 'le_douanier_history';

function loadHistory() {
  if (typeof localStorage === 'undefined') return [];
  try {
    const data = localStorage.getItem(HISTORY_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function saveHistory(history) {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
}

export const trackPoints = writable([]);

export const trackBounds = derived(trackPoints, ($trackPoints) => {
  return calculateBounds($trackPoints, 100);
});

export const originPoint = writable(null);
export const destinationPoint = writable(null);

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