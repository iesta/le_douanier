export function exportGPX(trackPoints, startIndex, endIndex, originName, destName, gpxName = 'export') {
  const points = trackPoints.slice(startIndex, endIndex + 1);

  const header = `<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1" creator="Le Douanier" xmlns="http://www.topografix.com/GPX/1/1">
  <metadata>
    <name>${gpxName} - ${originName} to ${destName}</name>
    <time>${new Date().toISOString()}</time>
  </metadata>
  <trk>
    <name>${originName} to ${destName}</name>
    <trkseg>
`;

  const trkpts = points.map(p =>
    `      <trkpt lat="${p.lat}" lon="${p.lon}">\n        <ele>${p.ele}</ele>\n      </trkpt>`
  ).join('\n');

  const footer = `
    </trkseg>
  </trk>
</gpx>`;

  return header + trkpts + footer;
}

export function downloadGPX(content, filename) {
  const blob = new Blob([content], { type: 'application/gpx+xml' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}