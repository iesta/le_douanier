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
  let trailLayer = null;
  let highlightLayer = null;
  let markersLayer = null;
  let connectionLines = null;

  onMount(async () => {
    const L = await import('leaflet');
    await import('leaflet/dist/leaflet.css');

    if (map) return;

    map = L.map(mapContainer).setView([48.6, -1.5], 9);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);

    trailLayer = L.layerGroup().addTo(map);
    highlightLayer = L.layerGroup().addTo(map);
    markersLayer = L.layerGroup().addTo(map);
    connectionLines = L.layerGroup().addTo(map);

    if ($trackPoints.length > 0) {
      plotTrail();
    }
  });

  function plotTrail() {
    if (!map || $trackPoints.length === 0) return;

    import('leaflet').then(L => {
      trailLayer.clearLayers();
      highlightLayer.clearLayers();

      const coords = $trackPoints.map(p => [p.lat, p.lon]);
      const polyline = L.polyline(coords, {
        color: '#3388ff',
        weight: 3,
        opacity: 0.7
      });
      trailLayer.addLayer(polyline);

      map.fitBounds(polyline.getBounds());
    });
  }

  function updateMarkers() {
    if (!map) return;

    import('leaflet').then(L => {
      markersLayer.clearLayers();
      connectionLines.clearLayers();
      highlightLayer.clearLayers();

      const redIcon = L.divIcon({ className: 'bg-red-500 w-4 h-4 rounded-full border-2 border-white', html: '<div class="w-full h-full bg-red-500 rounded-full"></div>' });
      const greenIcon = L.divIcon({ className: 'bg-green-500 w-4 h-4 rounded-full border-2 border-white', html: '<div class="w-full h-full bg-green-500 rounded-full"></div>' });
      const blueIcon = L.divIcon({ className: 'bg-blue-500 w-4 h-4 rounded-full border-2 border-white', html: '<div class="w-full h-full bg-blue-500 rounded-full"></div>' });

      if ($originPoint) {
        const origMarker = L.marker([$originPoint.lat, $originPoint.lon], { icon: redIcon })
          .bindPopup('Origin');
        markersLayer.addLayer(origMarker);

        if ($originNearestTrackPoint) {
          const origLine = L.polyline(
            [[$originPoint.lat, $originPoint.lon], [$originNearestTrackPoint.lat, $originNearestTrackPoint.lon]],
            { color: '#ef4444', weight: 2, dashArray: '5, 5' }
          );
          connectionLines.addLayer(origLine);

          const origTrackMarker = L.marker([$originNearestTrackPoint.lat, $originNearestTrackPoint.lon], { icon: blueIcon })
            .bindPopup('Origin Track Point');
          markersLayer.addLayer(origTrackMarker);
        }
      }

      if ($destinationPoint) {
        const destMarker = L.marker([$destinationPoint.lat, $destinationPoint.lon], { icon: greenIcon })
          .bindPopup('Destination');
        markersLayer.addLayer(destMarker);

        if ($destinationNearestTrackPoint) {
          const destLine = L.polyline(
            [[$destinationPoint.lat, $destinationPoint.lon], [$destinationNearestTrackPoint.lat, $destinationNearestTrackPoint.lon]],
            { color: '#22c55e', weight: 2, dashArray: '5, 5' }
          );
          connectionLines.addLayer(destLine);

          const destTrackMarker = L.marker([$destinationNearestTrackPoint.lat, $destinationNearestTrackPoint.lon], { icon: blueIcon })
            .bindPopup('Destination Track Point');
          markersLayer.addLayer(destTrackMarker);
        }
      }

      if ($originNearestTrackPoint && $destinationNearestTrackPoint) {
        const startIdx = Math.min($originNearestTrackPoint.index, $destinationNearestTrackPoint.index);
        const endIdx = Math.max($originNearestTrackPoint.index, $destinationNearestTrackPoint.index);

        const segmentCoords = $trackPoints.slice(startIdx, endIdx + 1).map(p => [p.lat, p.lon]);
        const segment = L.polyline(segmentCoords, {
          color: '#f59e0b',
          weight: 6,
          opacity: 1
        });
        highlightLayer.addLayer(segment);
      }
    });
  }

  $effect(() => {
    if ($trackPoints.length > 0 && map) {
      plotTrail();
    }
  });

  $effect(() => {
    if ($originPoint || $destinationPoint) {
      updateMarkers();
    }
  });
</script>

<div class="h-full flex flex-col">
  <div bind:this={mapContainer} class="flex-1 min-h-[500px]"></div>
</div>