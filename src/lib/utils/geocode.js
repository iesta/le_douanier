const NOMINATIM_URL = 'https://nominatim.openstreetmap.org/search';
const OVERPASS_URL = 'https://overpass-api.de/api/interpreter';

export function calculateBounds(points, paddingKm = 100) {
  if (!points || points.length === 0) return null;

  const lats = points.map(p => p.lat);
  const lons = points.map(p => p.lon);

  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLon = Math.min(...lons);
  const maxLon = Math.max(...lons);

  const kmPerDegLat = 111;
  const kmPerDegLon = 111 * Math.cos((minLat + maxLat) * Math.PI / 360);

  const latPad = paddingKm / kmPerDegLat;
  const lonPad = paddingKm / kmPerDegLon;

  return {
    south: minLat - latPad,
    north: maxLat + latPad,
    west: minLon - lonPad,
    east: maxLon + lonPad
  };
}

export async function searchPlace(query, limit = 10, bounds = null) {
  if (!query || query.length < 2) return [];

  const params = new URLSearchParams({
    q: query,
    format: 'json',
    limit,
    addressdetails: 1
  });

  if (bounds) {
    params.set('viewbox', `${bounds.west},${bounds.south},${bounds.east},${bounds.north}`);
    params.set('bounded', '1');
  }

  const res = await fetch(`${NOMINATIM_URL}?${params}`, {
    headers: { 'User-Agent': 'LeDouanier-App/1.0' }
  });

  if (!res.ok) throw new Error('Geocoding failed');
  return res.json();
}

export async function searchPOI(nearLat, nearLon, radiusMeters = 50000) {
  const query = `
    [out:json][timeout:30];
    (
      node["tourism"="hotel"](around:${radiusMeters},${nearLat},${nearLon});
      node["tourism"="guest_house"](around:${radiusMeters},${nearLat},${nearLon});
      node["tourism"="hostel"](around:${radiusMeters},${nearLat},${nearLon});
      node["tourism"="apartment"](around:${radiusMeters},${nearLat},${nearLon});
      node["amenity"="restaurant"](around:${radiusMeters},${nearLat},${nearLon});
      node["amenity"="cafe"](around:${radiusMeters},${nearLat},${nearLon});
      node["shop"](around:${radiusMeters},${nearLat},${nearLon});
    );
    out body;
  `;

  try {
    const res = await fetch(OVERPASS_URL, {
      method: 'POST',
      body: new URLSearchParams({ data: query }),
      headers: { 'User-Agent': 'LeDouanier-App/1.0' }
    });

    if (!res.ok) throw new Error('POI search failed');
    const data = await res.json();
    return data.elements || [];
  } catch (e) {
    console.error('POI search error:', e);
    return [];
  }
}