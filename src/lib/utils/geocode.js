const NOMINATIM_URL = 'https://nominatim.openstreetmap.org/search';
const OVERPASS_URL = 'https://overpass-api.de/api/interpreter';

export async function searchPlace(query, limit = 5) {
  if (!query || query.length < 2) return [];

  const params = new URLSearchParams({
    q: query,
    format: 'json',
    limit,
    addressdetails: 1,
    viewbox: '-5.5,48.0,-1.0,49.0'
  });

  const res = await fetch(`${NOMINATIM_URL}?${params}`, {
    headers: { 'User-Agent': 'GR34-Distance-Calculator' }
  });

  if (!res.ok) throw new Error('Geocoding failed');
  return res.json();
}

export async function searchPOI(nearLat, nearLon, radiusMeters = 50000) {
  const query = `
    [out:json][timeout:25];
    (
      node["tourism"="hotel"](around:${radiusMeters},${nearLat},${nearLon});
      node["tourism"="guest_house"](around:${radiusMeters},${nearLat},${nearLon});
      node["tourism"="hostel"](around:${radiusMeters},${nearLat},${nearLon});
      node["amenity"="restaurant"](around:${radiusMeters},${nearLat},${nearLon});
      node["amenity"="cafe"](around:${radiusMeters},${nearLat},${nearLon});
      node["shop"](around:${radiusMeters},${nearLat},${nearLon});
    );
    out body;
  `;

  const res = await fetch(OVERPASS_URL, {
    method: 'POST',
    body: new URLSearchParams({ data: query }),
    headers: { 'User-Agent': 'GR34-Distance-Calculator' }
  });

  if (!res.ok) throw new Error('POI search failed');
  const data = await res.json();
  return data.elements || [];
}