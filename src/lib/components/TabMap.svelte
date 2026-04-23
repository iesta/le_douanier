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
  let mapReady = false;

  onMount(async () => {
    const leaflet = await import('leaflet');
    L = leaflet.default || leaflet;

    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    document.head.appendChild(link);

    await new Promise(resolve => setTimeout(resolve, 50));

    map = L.map(mapContainer, {
      center: [48.6, -1.5],
      zoom: 9,
      zoomControl: true
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap',
      maxZoom: 18
    }).addTo(map);

    trailLayer = L.layerGroup().addTo(map);
    highlightLayer = L.layerGroup().addTo(map);
    markersLayer = L.layerGroup().addTo(map);
    connectionLines = L.layerGroup().addTo(map);

    mapReady = true;

    if ($trackPoints.length > 0) {
      plotTrail();
    }

    return () => {
      if (map) map.remove();
    };
  });

  function plotTrail() {
    if (!map || !L || $trackPoints.length === 0) return;

    trailLayer.clearLayers();

    const coords = $trackPoints.map(p => [p.lat, p.lon]);
    const polyline = L.polyline(coords, {
      color: '#3388ff',
      weight: 3,
      opacity: 0.8
    });
    trailLayer.addLayer(polyline);

    map.fitBounds(polyline.getBounds(), { padding: [30, 30] });
  }

  function updateMarkers() {
    if (!map || !L) return;

    markersLayer.clearLayers();
    connectionLines.clearLayers();
    highlightLayer.clearLayers();

    const icon = (color, size = 16) => L.divIcon({
      html: `<div style="width:${size}px;height:${size}px;background:${color};border:2px solid white;border-radius:50%;box-shadow:0 2px 4px rgba(0,0,0,0.3)"></div>`,
      className: 'marker-icon',
      iconSize: [size, size],
      iconAnchor: [size/2, size/2]
    });

    const redIcon = icon('#ef4444', 18);
    const greenIcon = icon('#22c55e', 18);
    const blueIcon = icon('#3b82f6', 12);

    if ($originPoint && $originNearestTrackPoint) {
      markersLayer.addLayer(L.marker([$originPoint.lat, $originPoint.lon], { icon: redIcon, zIndexOffset: 1000 })
        .bindPopup(`<b style="color:#ef4444">Origin</b><br>${$originPoint.name || 'Custom'}`));

      connectionLines.addLayer(L.polyline(
        [[$originPoint.lat, $originPoint.lon], [$originNearestTrackPoint.lat, $originNearestTrackPoint.lon]],
        { color: '#ef4444', weight: 2, dashArray: '5,5' }
      ));

      markersLayer.addLayer(L.marker([$originNearestTrackPoint.lat, $originNearestTrackPoint.lon], { icon: blueIcon })
        .bindPopup(`<b style="color:#3b82f6">A</b> #${$originNearestTrackPoint.index}`));
    }

    if ($destinationPoint && $destinationNearestTrackPoint) {
      markersLayer.addLayer(L.marker([$destinationPoint.lat, $destinationPoint.lon], { icon: greenIcon, zIndexOffset: 1000 })
        .bindPopup(`<b style="color:#22c55e">Destination</b><br>${$destinationPoint.name || 'Custom'}`));

      connectionLines.addLayer(L.polyline(
        [[$destinationPoint.lat, $destinationPoint.lon], [$destinationNearestTrackPoint.lat, $destinationNearestTrackPoint.lon]],
        { color: '#22c55e', weight: 2, dashArray: '5,5' }
      ));

      markersLayer.addLayer(L.marker([$destinationNearestTrackPoint.lat, $destinationNearestTrackPoint.lon], { icon: blueIcon })
        .bindPopup(`<b style="color:#3b82f6">B</b> #${$destinationNearestTrackPoint.index}`));
    }

    if ($originNearestTrackPoint && $destinationNearestTrackPoint) {
      const startIdx = Math.min($originNearestTrackPoint.index, $destinationNearestTrackPoint.index);
      const endIdx = Math.max($originNearestTrackPoint.index, $destinationNearestTrackPoint.index);
      const segmentCoords = $trackPoints.slice(startIdx, endIdx + 1).map(p => [p.lat, p.lon]);

      highlightLayer.addLayer(L.polyline(segmentCoords, {
        color: '#f59e0b',
        weight: 6,
        opacity: 1
      }));
    }
  }

  $effect(() => {
    if (mapReady && $trackPoints.length > 0) plotTrail();
  });

  $effect(() => {
    if (mapReady) updateMarkers();
  });
</script>

<div bind:this={mapContainer} class="w-full h-full"></div>

<style>
  :global(.marker-icon) {
    background: transparent !important;
    border: none !important;
  }
  :global(.leaflet-popup-content-wrapper) {
    border-radius: 8px;
    font-family: inherit;
  }
</style>