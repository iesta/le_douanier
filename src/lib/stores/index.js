import { writable, derived } from 'svelte/store';
import { haversine, findNearestTrackPointIndex } from '$lib/utils/geo.js';

export const trackPoints = writable([]);

export const originPoint = writable(null);
export const destinationPoint = writable(null);

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