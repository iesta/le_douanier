export function haversine(lat1, lon1, lat2, lon2) {
  const R = 6371000;
  const phi1 = lat1 * Math.PI / 180;
  const phi2 = lat2 * Math.PI / 180;
  const dphi = (lat2 - lat1) * Math.PI / 180;
  const dlambda = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dphi / 2) ** 2 +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(dlambda / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function parseGPX(xmlString) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(xmlString, 'text/xml');
  const trackpoints = [];

  const pts = doc.querySelectorAll('trkpt');
  pts.forEach((pt, index) => {
    trackpoints.push({
      lat: parseFloat(pt.getAttribute('lat')),
      lon: parseFloat(pt.getAttribute('lon')),
      ele: parseFloat(pt.querySelector('ele')?.textContent) || 0,
      time: pt.querySelector('time')?.textContent || null,
      index
    });
  });

  return trackpoints;
}

export function calculateTrailDistance(points, startIndex, endIndex) {
  let total = 0;
  for (let i = startIndex + 1; i <= endIndex; i++) {
    total += haversine(
      points[i - 1].lat, points[i - 1].lon,
      points[i].lat, points[i].lon
    );
  }
  return total;
}

export function calculateElevationStats(points, startIndex, endIndex) {
  let gain = 0;
  let loss = 0;

  for (let i = startIndex + 1; i <= endIndex; i++) {
    const diff = points[i].ele - points[i - 1].ele;
    if (diff > 0) gain += diff;
    else loss += Math.abs(diff);
  }

  return { gain, loss };
}

export function findNearestTrackPointIndex(lat, lon, points) {
  let minDist = Infinity;
  let nearestIndex = 0;

  for (let i = 0; i < points.length; i++) {
    const d = haversine(lat, lon, points[i].lat, points[i].lon);
    if (d < minDist) {
      minDist = d;
      nearestIndex = i;
    }
  }

  return { index: nearestIndex, distance: minDist };
}

export function estimateHikingTime(distanceKm, elevationGainM) {
  const baseSpeed = 4;
  const elevationPenalty = 0.1;
  const effectiveDistance = distanceKm / 1000 + (elevationGainM / 100) * elevationPenalty;
  return effectiveDistance / baseSpeed;
}