<script>
  import { onMount } from 'svelte';
  import {
    originPoint,
    destinationPoint,
    originNearestTrackPoint,
    destinationNearestTrackPoint,
    trackPoints
  } from '$lib/stores/index.js';

  let mapContainer;
  let map = null;
  let L = null;
  let trailLayer = null;
  let highlightLayer = null;
  let markersLayer = null;
  let connectionLines = null;
  let initialized = false;

  onMount(async () => {
    L = await import('leaflet');
    await import('leaflet/dist/leaflet.css');

    map = L.map(mapContainer, {
      center: [48.6, -1.5],
      zoom: 9
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);

    trailLayer = L.layerGroup().addTo(map);
    highlightLayer = L.layerGroup().addTo(map);
    markersLayer = L.layerGroup().addTo(map);
    connectionLines = L.layerGroup().addTo(map);

    initialized = true;

    if ($trackPoints.length > 0) {
      plotTrail();
    }
  });

  function plotTrail() {
    if (!map || !L || $trackPoints.length === 0) return;

    trailLayer.clearLayers();
    highlightLayer.clearLayers();

    const coords = $trackPoints.map(p => [p.lat, p.lon]);
    const polyline = L.polyline(coords, {
      color: '#3388ff',
      weight: 3,
      opacity: 0.7
    });
    trailLayer.addLayer(polyline);

    map.fitBounds(polyline.getBounds(), { padding: [20, 20] });
  }

  function updateMarkers() {
    if (!map || !L) return;

    markersLayer.clearLayers();
    connectionLines.clearLayers();
    highlightLayer.clearLayers();

    const redIcon = L.divIcon({
      className: 'custom-marker',
      html: '<div style="width:16px;height:16px;background:#ef4444;border:3px solid white;border-radius:50%;box-shadow:0 2px 4px rgba(0,0,0,0.3)"></div>',
      iconSize: [16, 16],
      iconAnchor: [8, 8]
    });

    const greenIcon = L.divIcon({
      className: 'custom-marker',
      html: '<div style="width:16px;height:16px;background:#22c55e;border:3px solid white;border-radius:50%;box-shadow:0 2px 4px rgba(0,0,0,0.3)"></div>',
      iconSize: [16, 16],
      iconAnchor: [8, 8]
    });

    const blueIcon = L.divIcon({
      className: 'custom-marker',
      html: '<div style="width:12px;height:12px;background:#3b82f6;border:2px solid white;border-radius:50%;box-shadow:0 1px 3px rgba(0,0,0,0.3)"></div>',
      iconSize: [12, 12],
      iconAnchor: [6, 6]
    });

    if ($originPoint && $originNearestTrackPoint) {
      const origMarker = L.marker([$originPoint.lat, $originPoint.lon], { icon: redIcon })
        .bindPopup('<b>Origin</b><br>' + ($originPoint.name || 'Custom'));
      markersLayer.addLayer(origMarker);

      const origLine = L.polyline(
        [[$originPoint.lat, $originPoint.lon], [$originNearestTrackPoint.lat, $originNearestTrackPoint.lon]],
        { color: '#ef4444', weight: 2, dashArray: '5, 5', opacity: 0.8 }
      );
      connectionLines.addLayer(origLine);

      const origTrackMarker = L.marker([$originNearestTrackPoint.lat, $originNearestTrackPoint.lon], { icon: blueIcon })
        .bindPopup('<b>A</b> (Point #' + $originNearestTrackPoint.index + ')');
      markersLayer.addLayer(origTrackMarker);
    }

    if ($destinationPoint && $destinationNearestTrackPoint) {
      const destMarker = L.marker([$destinationPoint.lat, $destinationPoint.lon], { icon: greenIcon })
        .bindPopup('<b>Destination</b><br>' + ($destinationPoint.name || 'Custom'));
      markersLayer.addLayer(destMarker);

      const destLine = L.polyline(
        [[$destinationPoint.lat, $destinationPoint.lon], [$destinationNearestTrackPoint.lat, $destinationNearestTrackPoint.lon]],
        { color: '#22c55e', weight: 2, dashArray: '5, 5', opacity: 0.8 }
      );
      connectionLines.addLayer(destLine);

      const destTrackMarker = L.marker([$destinationNearestTrackPoint.lat, $destinationNearestTrackPoint.lon], { icon: blueIcon })
        .bindPopup('<b>B</b> (Point #' + $destinationNearestTrackPoint.index + ')');
      markersLayer.addLayer(destTrackMarker);
    }

    if ($originNearestTrackPoint && $destinationNearestTrackPoint) {
      const startIdx = Math.min($originNearestTrackPoint.index, $destinationNearestTrackPoint.index);
      const endIdx = Math.max($originNearestTrackPoint.index, $destinationNearestTrackPoint.index);

      const segmentCoords = $trackPoints.slice(startIdx, endIdx + 1).map(p => [p.lat, p.lon]);
      const segment = L.polyline(segmentCoords, {
        color: '#f59e0b',
        weight: 5,
        opacity: 1
      });
      highlightLayer.addLayer(segment);
    }
  }

  $effect(() => {
    if (initialized && $trackPoints.length > 0) {
      plotTrail();
    }
  });

  $effect(() => {
    if (initialized && ($originPoint || $destinationPoint)) {
      updateMarkers();
    }
  });
</script>

<div class="h-full flex flex-col">
  <div bind:this={mapContainer} class="flex-1 min-h-[500px]"></div>
</div>