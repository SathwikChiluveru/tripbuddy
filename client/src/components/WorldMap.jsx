import worldTopology from '../assets/features.json';

const countryAliases = {
  us: 'united states',
  usa: 'united states',
  'united states of america': 'united states',
  uk: 'united kingdom',
  'czech republic': 'czechia',
  turkiye: 'turkey',
  neitherlands: 'netherlands'
};

const countryKey = name => {
  const key = String(name || '').trim().toLowerCase().replace(/\s+/g, ' ');
  return countryAliases[key] || key;
};

function topologyRing(arcs) {
  const points = [];
  for (const ref of arcs) {
    const arc = worldTopology.arcs[ref < 0 ? ~ref : ref];
    const segment = ref < 0 ? [...arc].reverse() : arc;
    points.push(...(points.length ? segment.slice(1) : segment));
  }
  return points;
}

function geometryPolygons(geometry) {
  if (geometry.type === 'Polygon') return [geometry.arcs];
  if (geometry.type === 'MultiPolygon') return geometry.arcs;
  return [];
}

function projectRing(ring) {
  return ring.map(([longitude, latitude]) => [
    ((longitude + 180) / 360) * 1000,
    ((90 - Math.max(-60, Math.min(85, latitude))) / 145) * 430 + 18
  ]);
}

const countryShapes = worldTopology.objects.world.geometries
  .filter(geometry => geometry.id !== 'ATA')
  .map(geometry => {
    const name = geometry.properties?.name || geometry.id;
    const paths = geometryPolygons(geometry)
      .flatMap(polygon => polygon.map(topologyRing).map(projectRing))
      .map(points => points.length ? `M${points.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join('L')}Z` : '')
      .filter(Boolean);
    return { name, key: countryKey(name), paths };
  });

export default function WorldMap({ visited = [], planned = [] }) {
  const visitedKeys = new Set(visited.map(countryKey));
  const plannedKeys = new Set(planned.map(countryKey));
  const knownKeys = new Set(countryShapes.map(shape => shape.key));
  const unplotted = [...visited, ...planned].filter(name => !knownKeys.has(countryKey(name)));
  return <section className="travel-map" aria-labelledby="travel-map-title">
    <div className="travel-map-heading">
      <div><h2 id="travel-map-title">Your world so far</h2><p>Every place has a story. The next one is waiting.</p></div>
      <div className="map-legend" aria-label="Map legend"><span><i className="map-dot visited-dot"/> Been there</span><span><i className="map-dot planned-dot"/> On the list</span></div>
    </div>
    <svg className="world-map" viewBox="0 0 1000 470" role="img" aria-label={`World map showing ${visited.length} countries visited and ${planned.length} planned`}>
      <defs><pattern id="planned-country-fill" width="8" height="8" patternTransform="rotate(35)" patternUnits="userSpaceOnUse"><rect width="8" height="8" fill="#f6f0e5"/><path d="M0 0V8" stroke="#c98c56" strokeWidth="2"/></pattern></defs>
      <g className="world-countries" aria-hidden="true">{countryShapes.map(shape => {
        const status = visitedKeys.has(shape.key) ? 'visited' : plannedKeys.has(shape.key) ? 'planned' : 'unvisited';
        return <path key={shape.key} className={`map-country ${status}`} d={shape.paths.join('')}><title>{shape.name}: {status === 'visited' ? 'Been there' : status === 'planned' ? 'On the list' : 'Not listed'}</title></path>;
      })}</g>
    </svg>
    <div className="map-country-lists">
      <div><h3><i className="map-dot visited-dot"/> Been there <span>{visited.length}</span></h3><div className="tags">{visited.map((country, index) => <span key={`${country}-${index}`}>{country}</span>)}</div>{!visited.length && <p>No countries added yet.</p>}</div>
      <div><h3><i className="map-dot planned-dot"/> On the list <span>{planned.length}</span></h3><div className="tags">{planned.map((country, index) => <span key={`${country}-${index}`}>{country}</span>)}</div>{!planned.length && <p>Dreaming of somewhere new?</p>}</div>
    </div>
    {unplotted.length > 0 && <p className="map-unplotted">{unplotted.length} {unplotted.length === 1 ? 'place is' : 'places are'} listed above but {unplotted.length === 1 ? 'is' : 'are'} not on the map yet.</p>}
  </section>;
}
