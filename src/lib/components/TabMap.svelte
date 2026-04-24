<script>
  import { onMount } from 'svelte';
  import { browser } from '$app/environment';
  import {
    originPoint,
    destinationPoint,
    originNearestTrackPoint,
    destinationNearestTrackPoint,
    trackPoints,
    selectedTab,
    tileProvider
  } from '$lib/stores/index.js';
  import { calculateTrailDistance, calculateElevationStats, estimateHikingTime } from '$lib/utils/geo.js';
  import { derived } from 'svelte/store';

  let mapContainer = $state(null);
  let map = null;
  let L = null;
  let trailLayer = null;
  let highlightLayer = null;
  let markersLayer = null;
  let connectionLines = null;
  let baseLayers = {};
  let currentBaseLayer = null;
  let layerControl = null;
  let mapReady = $state(false);

  const mapStats = derived(
    [originNearestTrackPoint, destinationNearestTrackPoint, trackPoints],
    ([$origin, $destination, $trackPoints]) => {
      if (!$origin || !$destination || $trackPoints.length === 0) return null;

      const startIdx = Math.min($origin.index, $destination.index);
      const endIdx = Math.max($origin.index, $destination.index);
      const trailDistance = calculateTrailDistance($trackPoints, startIdx, endIdx);
      const { gain, loss } = calculateElevationStats($trackPoints, startIdx, endIdx);
      const hikingTime = estimateHikingTime(trailDistance, gain);

      return {
        distance: trailDistance,
        gain,
        loss,
        hikingTime
      };
    }
  );

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
      zoom: 9,
      preferCanvas: false
    });

    // Define tile layers
    const osmLayer = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19
    });

    const topoLayer = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors, © OpenTopoMap',
      maxZoom: 17,
      subdomains: ['a', 'b', 'c']
    });

    const cycleLayer = L.tileLayer('https://{s}.tile-cyclosm.openstreetmap.fr/cyclosm/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors, © CyclOSM',
      maxZoom: 20
    });

    const satelliteLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
      attribution: '© Esri',
      maxZoom: 19
    });

    const stadiaLayer = L.tileLayer('https://tiles.stadiamaps.com/tiles/alidade_smooth/{z}/{x}/{y}{r}.png', {
      attribution: '© Stadia Maps, © OpenStreetMap contributors',
      maxZoom: 20
    });

    // Store layers in object
    baseLayers = {
      "OpenStreetMap": osmLayer,
      "OpenTopoMap": topoLayer,
      "CyclOSM": cycleLayer,
      "Satellite": satelliteLayer,
      "Stadia Maps": stadiaLayer
    };

    // Add initial base layer based on stored preference
    const initialProvider = $tileProvider || 'OpenStreetMap';
    currentBaseLayer = baseLayers[initialProvider] || osmLayer;
    currentBaseLayer.addTo(map);

    trailLayer = L.layerGroup().addTo(map);
    highlightLayer = L.layerGroup().addTo(map);
    markersLayer = L.layerGroup().addTo(map);
    connectionLines = L.layerGroup().addTo(map);

    // Add scale control
    L.control.scale({
      imperial: false,
      metric: true,
      maxWidth: 150,
      updateWhenIdle: true
    }).addTo(map);

    // Create layer control
    layerControl = L.control.layers(baseLayers, null, {
      collapsed: true,
      position: 'topright'
    }).addTo(map);

    // Listen for layer change events
    setTimeout(() => {
      const controlContainer = layerControl.getContainer();
      if (controlContainer) {
        controlContainer.addEventListener('click', function(e) {
          if (e.target.type === 'radio' && e.target.name === 'leaflet-base-layers') {
            const providerName = e.target.nextSibling.textContent.trim();
            tileProvider.set(providerName);
          }
        });
      }
    }, 100);

    mapReady = true;

    if ($trackPoints.length > 0) {
      plotTrail();
    }

    setTimeout(() => {
      if (map) map.invalidateSize();
    }, 100);
  }

  function formatNumber(num) {
    return num.toLocaleString('de-DE', { maximumFractionDigits: 0 });
  }

  function plotTrail() {
    if (!map || !L || !mapReady || $trackPoints.length === 0) return;

    trailLayer.clearLayers();
    highlightLayer.clearLayers();

    let boundsToUse;

    if ($originNearestTrackPoint && $destinationNearestTrackPoint) {
      const startIdx = Math.min($originNearestTrackPoint.index, $destinationNearestTrackPoint.index);
      const endIdx = Math.max($originNearestTrackPoint.index, $destinationNearestTrackPoint.index);
      const segmentCoords = $trackPoints.slice(startIdx, endIdx + 1).map(p => [p.lat, p.lon]);

      const segmentLine = L.polyline(segmentCoords, {
        color: '#f59e0b',
        weight: 6,
        opacity: 1,
        stroke: true,
        fill: false
      });

      highlightLayer.addLayer(segmentLine);
      boundsToUse = segmentLine.getBounds();
    } else {
      const coords = $trackPoints.map(p => [p.lat, p.lon]);
      const fullLine = L.polyline(coords, {
        color: '#3388ff',
        weight: 4,
        opacity: 1,
        stroke: true,
        fill: false
      });
      trailLayer.addLayer(fullLine);
      boundsToUse = fullLine.getBounds();
    }

    map.fitBounds(boundsToUse, { padding: [50, 50], maxZoom: 13 });
  }

  function updateMarkers() {
    if (!map || !L || !mapReady) return;

    markersLayer.clearLayers();
    connectionLines.clearLayers();

    const redIcon = L.divIcon({
      html: '<div style="background:#ef4444;width:20px;height:20px;border:3px solid white;border-radius:50%;box-shadow:0 2px 4px rgba(0,0,0,0.3)"></div>',
      className: 'marker-red',
      iconSize: [20, 20],
      iconAnchor: [10, 10]
    });

    const greenIcon = L.divIcon({
      html: '<div style="background:#22c55e;width:20px;height:20px;border:3px solid white;border-radius:50%;box-shadow:0 2px 4px rgba(0,0,0,0.3)"></div>',
      className: 'marker-green',
      iconSize: [20, 20],
      iconAnchor: [10, 10]
    });

    const blueIcon = L.divIcon({
      html: '<div style="background:#3b82f6;width:12px;height:12px;border:2px solid white;border-radius:50%;"></div>',
      className: 'marker-blue',
      iconSize: [12, 12],
      iconAnchor: [6, 6]
    });

    if ($originPoint && $originNearestTrackPoint) {
      const originMarker = L.marker([$originPoint.lat, $originPoint.lon], { icon: redIcon });
      originMarker.bindPopup(`<b style="color:#ef4444">Origin</b><br>${$originPoint.name || 'Custom'}`);
      markersLayer.addLayer(originMarker);

      connectionLines.addLayer(
        L.polyline(
          [[$originPoint.lat, $originPoint.lon], [$originNearestTrackPoint.lat, $originNearestTrackPoint.lon]],
          { color: '#ef4444', weight: 3, dashArray: '8,8', opacity: 0.9 }
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
          { color: '#22c55e', weight: 3, dashArray: '8,8', opacity: 0.9 }
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
        L.polyline(segmentCoords, { color: '#f59e0b', weight: 8, opacity: 1, stroke: true, fill: false })
      );

      const segmentBounds = L.latLngBounds(segmentCoords);
      map.fitBounds(segmentBounds, { padding: [60, 60], maxZoom: 13 });
    }
  }

  $effect(() => {
    if (map && mapReady && $trackPoints.length > 0) {
      plotTrail();
    }
  });

  $effect(() => {
    if (map && mapReady && ($originPoint || $destinationPoint)) {
      updateMarkers();
      plotTrail();
    }
  });

  $effect(() => {
    if (map && mapReady && $selectedTab === 3) {
      setTimeout(() => {
        if (map) map.invalidateSize();
        if ($trackPoints.length > 0) plotTrail();
        if ($originPoint || $destinationPoint) updateMarkers();
      }, 300);
    }
  });

  $effect(() => {
    if (map && mapReady && currentBaseLayer && $tileProvider) {
      const newLayer = baseLayers[$tileProvider];
      if (newLayer && newLayer !== currentBaseLayer) {
        map.removeLayer(currentBaseLayer);
        newLayer.addTo(map);
        currentBaseLayer = newLayer;
        
        // Update layer control selection
        setTimeout(() => {
          if (layerControl && layerControl.getContainer()) {
            const radios = layerControl.getContainer().querySelectorAll('input[type="radio"]');
            radios.forEach(radio => {
              if (radio.nextSibling && radio.nextSibling.textContent.trim() === $tileProvider) {
                radio.checked = true;
              }
            });
          }
        }, 50);
      }
    }
  });
</script>

<div bind:this={mapContainer} style="width: 100%; height: 100%; min-height: 500px; display: block; position: relative;">
  {#if $mapStats}
    <div class="map-stats-overlay">
      <div class="stat-item">
        <span class="stat-value">{formatNumber($mapStats.distance / 1000)}</span>
        <span class="stat-unit">km</span>
      </div>
      <div class="stat-divider"></div>
      <div class="stat-item">
        <span class="stat-value">{Math.floor($mapStats.hikingTime)}h {$mapStats.hikingTime % 1 > 0 ? Math.round(($mapStats.hikingTime % 1) * 60) : '00'}m</span>
      </div>
      <div class="stat-divider"></div>
      <div class="stat-item">
        <span class="stat-value stat-gain">+{formatNumber($mapStats.gain)}</span>
        <span class="stat-unit">m</span>
      </div>
      <div class="stat-item">
        <span class="stat-value stat-loss">-{formatNumber($mapStats.loss)}</span>
        <span class="stat-unit">m</span>
      </div>
    </div>
  {/if}
</div>

<style>
  :global(.leaflet-container) {
    width: 100%;
    height: 100%;
    font-family: inherit;
    background: #a0c4e8;
  }

  :global(.leaflet-control-scale) {
    margin-bottom: 10px !important;
    margin-left: 10px !important;
    border: 2px solid rgba(0, 0, 0, 0.2) !important;
    border-radius: 4px !important;
    background-color: white !important;
    padding: 2px 5px !important;
    font-size: 11px !important;
  }

  :global(.leaflet-control-layers) {
    border-radius: 4px !important;
    background: white !important;
    box-shadow: 0 1px 5px rgba(0, 0, 0, 0.4) !important;
  }

  :global(.leaflet-control-layers-expanded) {
    padding: 10px !important;
    min-width: 180px !important;
  }

  :global(.leaflet-control-layers label) {
    display: block !important;
    margin: 5px 0 !important;
    cursor: pointer !important;
    font-size: 13px !important;
  }

  :global(.leaflet-control-layers input[type="radio"]) {
    margin-right: 8px !important;
  }
  :global(.leaflet-popup-content-wrapper) {
    border-radius: 8px;
  }
  :global(path.leaflet-interactive) {
    stroke: #3388ff !important;
    stroke-width: 4px !important;
    fill: none !important;
  }
  :global(.marker-red, .marker-green, .marker-blue) {
    background: transparent !important;
    border: none !important;
  }

  .map-stats-overlay {
    position: absolute;
    bottom: 30px;
    right: 10px;
    background: rgba(255, 255, 255, 0.95);
    border-radius: 8px;
    padding: 8px 12px;
    display: flex;
    align-items: center;
    gap: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
    z-index: 1000;
    font-size: 11px;
  }

  .stat-item {
    display: flex;
    align-items: baseline;
    gap: 2px;
  }

  .stat-value {
    font-weight: 600;
    color: #1f2937;
  }

  .stat-unit {
    color: #6b7280;
    font-size: 10px;
  }

  .stat-gain {
    color: #22c55e;
  }

  .stat-loss {
    color: #ef4444;
  }

  .stat-divider {
    width: 1px;
    height: 16px;
    background: #e5e7eb;
  }
</style>