<script>
  import { onMount } from 'svelte';
  import { browser } from '$app/environment';
  import {
    originPoint,
    destinationPoint,
    originNearestTrackPoint,
    destinationNearestTrackPoint,
    trackPoints
  } from '$lib/stores/index.js';

  let mapContainer = $state(null);
  let map = null;
  let L = null;
  let trailLayer = null;
  let highlightLayer = null;
  let markersLayer = null;
  let connectionLines = null;

  onMount(() => {
    if (!browser) return;

    initMap();

    return () => {
      if (map) {
        map.remove();
        map = null;
      }
    };
  });

  async function initMap() {
    L = (await import('leaflet')).default;

    const linkEl = document.createElement('link');
    linkEl.rel = 'stylesheet';
    linkEl.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    document.head.appendChild(linkEl);

    await new Promise(r => setTimeout(r, 100));

    if (!mapContainer) return;

    map = L.map(mapContainer, {
      center: [48.6, -1.5],
      zoom: 9
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap'
    }).addTo(map);

    trailLayer = L.layerGroup().addTo(map);
    highlightLayer = L.layerGroup().addTo(map);
    markersLayer = L.layerGroup().addTo(map);
    connectionLines = L.layerGroup().addTo(map);

    if ($trackPoints.length > 0) {
      plotTrail();
    }
  }

  function plotTrail() {
    if (!map || !L || $trackPoints.length === 0) return;

    trailLayer.clearLayers();
    highlightLayer.clearLayers();

    const coords = $trackPoints.map(p => [p.lat, p.lon]);
    const polyline = L.polyline(coords, {
      color: '#3388ff',
      weight: 3,
      opacity: 0.8
    });

    trailLayer.addLayer(polyline);
    map.fitBounds(polyline.getBounds(), { padding: [50, 50] });
  }

  function updateMarkers() {
    if (!map || !L) return;

    markersLayer.clearLayers();
    connectionLines.clearLayers();
    highlightLayer.clearLayers();

    const redIcon = L.divIcon({
      html: '<div style="width:20px;height:20px;background:#ef4444;border:3px solid white;border-radius:50%;box-shadow:0 2px 4px rgba(0,0,0,0.3)"></div>',
      className: '',
      iconSize: [20, 20],
      iconAnchor: [10, 10]
    });

    const greenIcon = L.divIcon({
      html: '<div style="width:20px;height:20px;background:#22c55e;border:3px solid white;border-radius:50%;box-shadow:0 2px 4px rgba(0,0,0,0.3)"></div>',
      className: '',
      iconSize: [20, 20],
      iconAnchor: [10, 10]
    });

    const blueIcon = L.divIcon({
      html: '<div style="width:14px;height:14px;background:#3b82f6;border:2px solid white;border-radius:50%;box-shadow:0 1px 3px rgba(0,0,0,0.3)"></div>',
      className: '',
      iconSize: [14, 14],
      iconAnchor: [7, 7]
    });

    if ($originPoint && $originNearestTrackPoint) {
      markersLayer.addLayer(
        L.marker([$originPoint.lat, $originPoint.lon], { icon: redIcon, zIndexOffset: 1000 })
          .bindPopup(`<b style="color:#ef4444">Origin</b><br>${$originPoint.name || 'Custom'}`)
      );

      connectionLines.addLayer(
        L.polyline(
          [[$originPoint.lat, $originPoint.lon], [$originNearestTrackPoint.lat, $originNearestTrackPoint.lon]],
          { color: '#ef4444', weight: 2, dashArray: '5,5', opacity: 0.8 }
        )
      );

      markersLayer.addLayer(
        L.marker([$originNearestTrackPoint.lat, $originNearestTrackPoint.lon], { icon: blueIcon })
          .bindPopup(`<b style="color:#3b82f6">A</b> #${$originNearestTrackPoint.index}`)
      );
    }

    if ($destinationPoint && $destinationNearestTrackPoint) {
      markersLayer.addLayer(
        L.marker([$destinationPoint.lat, $destinationPoint.lon], { icon: greenIcon, zIndexOffset: 1000 })
          .bindPopup(`<b style="color:#22c55e">Destination</b><br>${$destinationPoint.name || 'Custom'}`)
      );

      connectionLines.addLayer(
        L.polyline(
          [[$destinationPoint.lat, $destinationPoint.lon], [$destinationNearestTrackPoint.lat, $destinationNearestTrackPoint.lon]],
          { color: '#22c55e', weight: 2, dashArray: '5,5', opacity: 0.8 }
        )
      );

      markersLayer.addLayer(
        L.marker([$destinationNearestTrackPoint.lat, $destinationNearestTrackPoint.lon], { icon: blueIcon })
          .bindPopup(`<b style="color:#3b82f6">B</b> #${$destinationNearestTrackPoint.index}`)
      );
    }

    if ($originNearestTrackPoint && $destinationNearestTrackPoint) {
      const startIdx = Math.min($originNearestTrackPoint.index, $destinationNearestTrackPoint.index);
      const endIdx = Math.max($originNearestTrackPoint.index, $destinationNearestTrackPoint.index);
      const segmentCoords = $trackPoints.slice(startIdx, endIdx + 1).map(p => [p.lat, p.lon]);

      highlightLayer.addLayer(
        L.polyline(segmentCoords, { color: '#f59e0b', weight: 6, opacity: 1 })
      );
    }
  }

  $effect(() => {
    if (map && $trackPoints.length > 0) {
      plotTrail();
    }
  });

  $effect(() => {
    if (map && ($originPoint || $destinationPoint)) {
      updateMarkers();
    }
  });
</script>

<div bind:this={mapContainer} class="w-full h-full min-h-[500px]"></div>

<style>
  :global(.leaflet-container) {
    width: 100%;
    height: 100%;
    font-family: inherit;
  }
  :global(.leaflet-popup-content-wrapper) {
    border-radius: 8px;
  }
</style>