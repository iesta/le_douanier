# Le Douanier

A hiking distance calculator for the GR34 Sentier des Douaniers (French customs trail) along Brittany's coast.

## What it does

- Search for any place, hotel, or restaurant along the trail
- Select origin and destination points
- Calculates trail distance between points using Haversine formula
- Shows elevation gain/loss and estimated hiking time
- Interactive map with the full trail and selected segment

## Tech Stack

- **Framework**: SvelteKit
- **Styling**: TailwindCSS
- **Map**: Leaflet + OpenStreetMap
- **APIs**: Nominatim (geocoding), Overpass (POI search)
- **Data**: Hardcoded GPX track (GR34 2020, ~2090km)

## Features

- 5-tab interface: Origin, Destination, Distance/Info, Map, Preferences
- State machine: changing origin/destination auto-updates results
- Search places with autocomplete
- Find hotels/POIs within 50km of selected location
- Coordinates input available (hidden by default)
- Dark mode support
- km/miles toggle (in Preferences)

## Running

```bash
cd le_douanier
npm install
npm run dev
```

## Project Structure

```
src/
├── lib/
│   ├── components/     # Tab components
│   ├── stores/         # Svelte stores (state)
│   └── utils/          # Geo utilities, API calls
├── routes/             # SvelteKit pages
static/gpx/             # GR34 track data
```

## License

MIT