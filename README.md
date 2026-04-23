# Le Douanier

A hiking distance calculator for coastal trails in France.

## Origin

This project was created before hiking the **GR34 Sentier des Douaniers** (French customs trail) along Brittany's coastline. The goal was to calculate the actual walking distance between two stages located directly on the trail — accounting for the path's actual winding route, not just a straight line.

## What it does

- Search for any place, hotel, or restaurant along the trail
- Select origin and destination points on the trail
- Calculates **trail distance** (not straight-line) between points using the Haversine formula along the GPX track
- Shows elevation gain/loss and estimated hiking time
- Interactive map displaying the full trail and the selected segment

## Roadmap

- [ ] Support for alternative/secondary paths
- [ ] Upload any GPX file (not just GR34)
- [ ] Expand to most French Grande Randonnées (GR)
- [ ] Better design
- [ ] Functional map with full features
- [ ] Mobile version
- [ ] DESIGN.md with design specifications

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