import { writable, derived } from 'svelte/store';
import { findNearestTrackPointIndex } from '$lib/utils/geo.js';
import { calculateBounds } from '$lib/utils/geocode.js';

export const availableGPX = writable([
  { name: 'GR34 Sentier des Douaniers (Brittany)', file: 'gr34-sentier-des-douaniers-2020.gpx', distance: '~2090km' },
  { name: 'GR20 Corsica (North-South)', file: 'gr20-2018-complete-northsouth.gpx', distance: '~180km' }
]);

export const selectedGpx = writable('gr34-sentier-des-douaniers-2020.gpx');
export const trackPoints = writable([]);
export const trackName = writable('');

export const trackBounds = derived(trackPoints, ($trackPoints) => {
  return calculateBounds($trackPoints, 100);
});

export const originPoint = writable(null);
export const destinationPoint = writable(null);

export const recentPlaces = writable([]);

export const recentPlacesForCurrentGpx = derived(
  [recentPlaces, selectedGpx],
  ([$recentPlaces, $selectedGpx]) => {
    return $recentPlaces.filter(p => p.gpx === $selectedGpx);
  }
);

export function addToRecentPlaces(place) {
  recentPlaces.update(items => {
    const filtered = items.filter(i => !(i.lat === place.lat && i.lon === place.lon && i.gpx === $selectedGpx));
    return [{ ...place, gpx: $selectedGpx }, ...filtered].slice(0, 20);
  });
}

export const history = writable([]);

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
    return [entry, ...h].slice(0, 20);
  });
}

export function clearHistory() {
  history.set([]);
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

export const preferences = writable({ unit: 'km', darkMode: true, showCoordinates: false });

export function updatePreferences(updates) {
  preferences.update(p => ({ ...p, ...updates }));
}
