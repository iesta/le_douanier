<script>
  import {
    originPoint,
    destinationPoint,
    originNearestTrackPoint,
    destinationNearestTrackPoint,
    trackPoints,
    addToHistory
  } from '$lib/stores/index.js';
  import {
    calculateTrailDistance,
    calculateElevationStats,
    estimateHikingTime
  } from '$lib/utils/geo.js';
  import { derived } from 'svelte/store';

  let lastSavedId = null;

  const distanceInfo = derived(
    [originNearestTrackPoint, destinationNearestTrackPoint, trackPoints],
    ([$origin, $destination, $trackPoints]) => {
      if (!$origin || !$destination || $trackPoints.length === 0) {
        return null;
      }

      const startIndex = Math.min($origin.index, $destination.index);
      const endIndex = Math.max($origin.index, $destination.index);

      const trailDistance = calculateTrailDistance($trackPoints, startIndex, endIndex);
      const { gain, loss } = calculateElevationStats($trackPoints, startIndex, endIndex);
      const hikingTime = estimateHikingTime(trailDistance, gain);

      return {
        originToPath: $origin.distanceToUser,
        destinationToPath: $destination.distanceToUser,
        trailDistance,
        gain,
        loss,
        hikingTime,
        startIndex,
        endIndex
      };
    }
  );

  $effect(() => {
    if ($distanceInfo && $originPoint && $destinationPoint) {
      const id = `${$originPoint.lat}-${$originPoint.lon}-${$destinationPoint.lat}-${$destinationPoint.lon}`;
      if (id !== lastSavedId) {
        lastSavedId = id;
        addToHistory($originPoint, $destinationPoint, $distanceInfo.trailDistance);
      }
    }
  });
</script>

<div class="p-4 pb-20">
  <h2 class="text-xl font-bold mb-4 text-gray-900 dark:text-white">Distance & Info</h2>

  {#if !$originPoint || !$destinationPoint}
    <div class="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
      <p class="text-yellow-800 dark:text-yellow-200">Set origin and destination in the Route tab first.</p>
    </div>
  {:else if $distanceInfo}
    <div class="space-y-4">
      <div class="p-3 bg-gray-100 dark:bg-gray-800 rounded-lg text-xs">
        <p class="text-gray-600 dark:text-gray-400">
          <span class="font-medium">From:</span> {$originPoint?.name || 'Origin'} (point #{$originNearestTrackPoint?.index})
        </p>
        <p class="text-gray-600 dark:text-gray-400">
          <span class="font-medium">To:</span> {$destinationPoint?.name || 'Destination'} (point #{$destinationNearestTrackPoint?.index})
        </p>
      </div>

      <div class="grid grid-cols-2 gap-3">
        <div class="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <p class="text-xs text-blue-600 dark:text-blue-400 uppercase">Origin → Path</p>
          <p class="text-lg font-bold text-blue-700 dark:text-blue-300">{$distanceInfo.originToPath.toFixed(0)} m</p>
        </div>
        <div class="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <p class="text-xs text-blue-600 dark:text-blue-400 uppercase">Destination → Path</p>
          <p class="text-lg font-bold text-blue-700 dark:text-blue-300">{$distanceInfo.destinationToPath.toFixed(0)} m</p>
        </div>
      </div>

      <div class="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
        <p class="text-xs text-green-600 dark:text-green-400 uppercase">Trail Distance</p>
        <p class="text-3xl font-bold text-green-700 dark:text-green-300">{($distanceInfo.trailDistance / 1000).toFixed(2)} km</p>
        <p class="text-sm text-green-600 dark:text-green-400">({$distanceInfo.trailDistance.toFixed(0)} m)</p>
      </div>

      <div class="grid grid-cols-2 gap-3">
        <div class="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
          <p class="text-xs text-green-600 dark:text-green-400 uppercase">Altitude Gain</p>
          <p class="text-lg font-bold text-green-700 dark:text-green-300">+{$distanceInfo.gain.toFixed(0)} m</p>
        </div>
        <div class="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
          <p class="text-xs text-red-600 dark:text-red-400 uppercase">Altitude Loss</p>
          <p class="text-lg font-bold text-red-700 dark:text-red-300">-{$distanceInfo.loss.toFixed(0)} m</p>
        </div>
      </div>

      <div class="p-4 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg">
        <p class="text-xs text-purple-600 dark:text-purple-400 uppercase">Est. Hiking Time</p>
        <p class="text-2xl font-bold text-purple-700 dark:text-purple-300">
          {Math.floor($distanceInfo.hikingTime)}h {$distanceInfo.hikingTime % 1 > 0 ? Math.round(($distanceInfo.hikingTime % 1) * 60) : '00'}m
        </p>
        <p class="text-xs text-purple-500 dark:text-purple-400">at 4 km/h + elevation</p>
      </div>

      <div class="p-3 bg-gray-100 dark:bg-gray-800 rounded-lg">
        <p class="text-xs text-gray-500 dark:text-gray-400 uppercase mb-1">Track Points Index</p>
        <p class="text-sm text-gray-700 dark:text-gray-300">
          From point #{$distanceInfo.startIndex} to point #{$distanceInfo.endIndex}
        </p>
      </div>
    </div>
  {:else}
    <div class="p-4 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
      <p class="text-gray-500 dark:text-gray-400">Calculating...</p>
    </div>
  {/if}
</div>