# Le Douanier

## English

A hiking distance calculator for coastal trails in France.

### Origin

This project was created before hiking the **GR34 Sentier des Douaniers** (French customs trail) along Brittany's coastline. The goal was to calculate the actual walking distance between two stages located directly on the trail — accounting for the path's actual winding route, not just a straight line.

### What it does

- Search for any place, hotel, or restaurant along the trail
- Select origin and destination points on the trail
- Calculates **trail distance** (not straight-line) between points using the Haversine formula along the GPX track
- Shows elevation gain/loss and estimated hiking time
- Interactive map displaying the full trail and the selected segment

### Roadmap

- [ ] Support for alternative/secondary paths
- [ ] Upload any GPX file (not just GR34)
- [ ] Expand to most French Grande Randonnées (GR)
- [ ] Better design
- [ ] Functional map with full features
- [ ] Mobile version
- [ ] DESIGN.md with design specifications

### Tech Stack

- **Framework**: SvelteKit
- **Styling**: TailwindCSS
- **Map**: Leaflet + OpenStreetMap
- **APIs**: Nominatim (geocoding), Overpass (POI search)
- **Data**: Hardcoded GPX track (GR34 2020, ~2090km)

### Features

- 4-tab interface: Route, Distance/Info, Map, Preferences
- State machine: changing route auto-updates results
- Search places with autocomplete
- Find hotels/POIs within 50km of selected location
- Coordinates input available (hidden by default)
- Dark mode support
- km/miles toggle (in Preferences)

### Running

```bash
npm install
npm run dev
```

### Project Structure

```
src/
├── lib/
│   ├── components/     # Tab components
│   ├── stores/          # Svelte stores (state)
│   └── utils/           # Geo utilities, API calls
├── routes/              # SvelteKit pages
static/gpx/              # GR34 track data
```

---

## Français

Un calculateur de distance de randonnée pour les sentiers côtiers en France.

### Origine

Ce projet a été créé avant de partir sur le **GR34 Sentier des Douaniers** le long de la côte bretonne. L'objectif était de calculer la distance réelle entre deux étapes situées sur le chemin — en tenant compte du tracé sinueux du sentier, et non d'une simple ligne droite.

### Fonctionnalités

- Rechercher n'importe quel lieu, hôtel ou restaurant le long du sentier
- Sélectionner un point de départ et d'arrivée sur le sentier
- Calcule la **distance effective** (pas la ligne droite) entre deux points en utilisant la formule de Haversine le long de la piste GPX
- Affiche le dénivelé positif/négatif et le temps de marche estimé
- Carte interactive montrant le sentier complet et le segment sélectionné

### Roadmap

- [ ] Gérer les chemins alternatifs
- [ ] Upload de n'importe quel fichier GPX (pas seulement le GR34)
- [ ] Étendre à la plupart des GR françaises
- [ ] Meilleur design
- [ ] Carte fonctionnelle
- [ ] Version mobile
- [ ] DESIGN.md avec les spécifications de design

### Stack technique

- **Framework**: SvelteKit
- **Style**: TailwindCSS
- **Carte**: Leaflet + OpenStreetMap
- **APIs**: Nominatim (géocodage), Overpass (recherche POI)
- **Données**: Piste GPX intégrée (GR34 2020, ~2090km)

### Interface

- 4 onglets : Route, Distance/Info, Carte, Préférences
- Machine à états : changer la route met à jour automatiquement les résultats
- Recherche de lieux avec autocomplétion
- Trouver hôtels/POIs dans un rayon de 50km
- Saisie de coordonnées disponible (masquée par défaut)
- Mode sombre
- Toggle km/miles (dans Préférences)

### Lancer le projet

```bash
npm install
npm run dev
```

### Structure du projet

```
src/
├── lib/
│   ├── components/     # Composants d'onglets
│   ├── stores/          # Stores Svelte (état)
│   └── utils/            # Utilitaires geo, appels API
├── routes/              # Pages SvelteKit
static/gpx/              # Données de piste GR34
```

## License

MIT