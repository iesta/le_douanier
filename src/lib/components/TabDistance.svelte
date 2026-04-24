<script>
  import {
    originPoint,
    destinationPoint,
    originNearestTrackPoint,
    destinationNearestTrackPoint,
    trackPoints,
    trackName,
    addToHistory,
    selectedTab
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

  function goToMap() {
    selectedTab.set(3);
  }
</script>

<div class="p-4 pb-20">
  <h2 class="text-xl font-bold mb-4 text-white">Distance & Info</h2>

  {#if !$originPoint || !$destinationPoint}
    <div class="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
      <div class="flex justify-between items-center">
        <p class="text-yellow-800">Set origin and destination in the Route tab first.</p>
        <button onclick={() => selectedTab.set(1)} class="px-4 py-2 bg-yellow-600 text-white rounded-lg text-sm font-medium hover:bg-yellow-700">
          Go to Route
        </button>
      </div>
    </div>
  {:else if $distanceInfo}
    <div class="space-y-4">
      <div class="p-4 bg-green-50 border border-green-200 rounded-lg">
        <div class="flex justify-between items-start">
          <div>
            <p class="text-xs text-green-600 uppercase">Distance</p>
            <p class="text-3xl font-bold text-green-700">{formatNumber($distanceInfo.trailDistance / 1000)} km</p>
            <p class="text-sm text-green-600">({formatNumber($distanceInfo.trailDistance)} m)</p>
          </div>
          <button onclick={goToMap} class="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 whitespace-nowrap">
            View on Map
          </button>
        </div>
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
          <p class="text-xs text-gray-500 uppercase mt-1">Start Alt</p>
          <p class="text-sm font-bold text-gray-700">{formatNumber($distanceInfo.startEle)} m</p>
        </div>
        <div class="p-3 bg-red-50 rounded-lg">
          <p class="text-xs text-red-600 uppercase">Altitude Loss</p>
          <p class="text-lg font-bold text-red-700">-{formatNumber($distanceInfo.loss)} m</p>
          <p class="text-xs text-gray-500 uppercase mt-1">End Alt</p>
          <p class="text-sm font-bold text-gray-700">{formatNumber($distanceInfo.endEle)} m</p>
        </div>
      </div>

      <div class="p-3 bg-blue-50 rounded-lg">
        <div class="flex justify-between items-center mb-2">
          <p class="text-xs text-blue-600 uppercase">Points</p>
          <button onclick={downloadSegment} class="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">
            Download GPX
          </button>
        </div>
        <p class="text-xs"><span class="font-medium">From:</span> {$originPoint?.name} (#{$originNearestTrackPoint?.index})</p>
        <p class="text-xs"><span class="font-medium">To:</span> {$destinationPoint?.name} (#{$destinationNearestTrackPoint?.index})</p>
      </div>

      <div class="p-3 bg-orange-50 rounded-lg">
        <p class="text-xs text-orange-600 uppercase mb-2">Straight Line Distance</p>
        <p class="text-xs"><span class="font-medium">Start → Path:</span> {formatNumber($distanceInfo.originToPath)} m</p>
        <p class="text-xs"><span class="font-medium">End → Path:</span> {formatNumber($distanceInfo.destinationToPath)} m</p>
      </div>
    </div>
  {:else}
    <div class="p-4 bg-gray-50 border rounded-lg">
      <p class="text-gray-500">Calculating...</p>
    </div>
  {/if}
</div>