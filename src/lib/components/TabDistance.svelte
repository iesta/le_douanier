<script>
  import {
    originPoint,
    destinationPoint,
    originNearestTrackPoint,
    destinationNearestTrackPoint,
    trackPoints,
    trackName,
    addToHistory
  } from '$lib/stores/index.js';
  import { calculateTrailDistance, calculateElevationStats, estimateHikingTime } from '$lib/utils/geo.js';
  import { exportGPX, downloadGPX } from '$lib/utils/export.js';
  import { derived } from 'svelte/store';

  function formatNumber(num) {
    return num.toLocaleString('de-DE', { maximumFractionDigits: 2 });
  }

  let lastSavedId = null;

  const distanceInfo = derived(
    [originNearestTrackPoint, destinationNearestTrackPoint, trackPoints],
    ([$origin, $destination, $trackPoints]) => {
      if (!$origin || !$destination || $trackPoints.length === 0) return null;

      const startIndex = Math.min($origin.index, $destination.index);
      const endIndex = Math.max($origin.index, $destination.index);
      const trailDistance = calculateTrailDistance($trackPoints, startIndex, endIndex);
      const { gain, loss } = calculateElevationStats($trackPoints, startIndex, endIndex);
      const hikingTime = estimateHikingTime(trailDistance, gain);

      const startEle = $trackPoints[startIndex]?.ele || 0;
      const endEle = $trackPoints[endIndex]?.ele || 0;
      return { originToPath: $origin.distanceToUser, destinationToPath: $destination.distanceToUser, trailDistance, gain, loss, hikingTime, startIndex, endIndex, startEle, endEle };
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

  function downloadSegment() {
    if (!$distanceInfo || !$originNearestTrackPoint || !$destinationNearestTrackPoint) return;
    const startIdx = Math.min($originNearestTrackPoint.index, $destinationNearestTrackPoint.index);
    const endIdx = Math.max($originNearestTrackPoint.index, $destinationNearestTrackPoint.index);
    const gpx = exportGPX($trackPoints, startIdx, endIdx, $originPoint.name, $destinationPoint.name, $trackName || 'GR34');
    const filename = `le-douanier-${$originPoint.name.replace(/[^a-z0-9]/gi, '-').substring(0, 20)}-${$destinationPoint.name.replace(/[^a-z0-9]/gi, '-').substring(0, 20)}.gpx`;
    downloadGPX(gpx, filename);
  }
</script>

<div class="p-4 pb-20">
  <h2 class="text-xl font-bold mb-4">Distance & Info</h2>

  {#if !$originPoint || !$destinationPoint}
    <div class="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
      <p class="text-yellow-800">Set origin and destination in the Route tab first.</p>
    </div>
  {:else if $distanceInfo}
    <div class="space-y-4">
      <div class="p-4 bg-green-50 border border-green-200 rounded-lg">
        <p class="text-xs text-green-600 uppercase">Distance</p>
        <p class="text-3xl font-bold text-green-700">{formatNumber($distanceInfo.trailDistance / 1000)} km</p>
        <p class="text-sm text-green-600">({formatNumber($distanceInfo.trailDistance)} m)</p>
      </div>

      <div class="p-4 bg-purple-50 border border-purple-200 rounded-lg">
        <p class="text-xs text-purple-600 uppercase">Est. Hiking Time</p>
        <p class="text-2xl font-bold text-purple-700">
          {Math.floor($distanceInfo.hikingTime)}h {$distanceInfo.hikingTime % 1 > 0 ? Math.round(($distanceInfo.hikingTime % 1) * 60) : '00'}m
        </p>
        <p class="text-xs text-purple-500">at 4 km/h + elevation</p>
      </div>

      <div class="grid grid-cols-2 gap-3">
        <div class="p-3 bg-green-50 rounded-lg">
          <p class="text-xs text-green-600 uppercase">Altitude Gain</p>
          <p class="text-lg font-bold text-green-700">+{formatNumber($distanceInfo.gain)} m</p>
        </div>
        <div class="p-3 bg-red-50 rounded-lg">
          <p class="text-xs text-red-600 uppercase">Altitude Loss</p>
          <p class="text-lg font-bold text-red-700">-{formatNumber($distanceInfo.loss)} m</p>
        </div>
      </div>

      <div class="grid grid-cols-2 gap-3">
        <div class="p-3 bg-gray-100 rounded-lg">
          <p class="text-xs text-gray-600 uppercase">Start Altitude</p>
          <p class="text-lg font-bold text-gray-700">{formatNumber($distanceInfo.startEle)} m</p>
        </div>
        <div class="p-3 bg-gray-100 rounded-lg">
          <p class="text-xs text-gray-600 uppercase">End Altitude</p>
          <p class="text-lg font-bold text-gray-700">{formatNumber($distanceInfo.endEle)} m</p>
        </div>
      </div>

      <div class="p-3 bg-blue-50 rounded-lg">
        <p class="text-xs text-blue-600 uppercase mb-2">Points</p>
        <p class="text-xs"><span class="font-medium">From:</span> {$originPoint?.name} (#{$originNearestTrackPoint?.index})</p>
        <p class="text-xs"><span class="font-medium">To:</span> {$destinationPoint?.name} (#{$destinationNearestTrackPoint?.index})</p>
      </div>

      <button onclick={downloadSegment} class="w-full py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700">
        ⬇ Download GPX Segment
      </button>
    </div>
  {:else}
    <div class="p-4 bg-gray-50 border rounded-lg">
      <p class="text-gray-500">Calculating...</p>
    </div>
  {/if}
</div>