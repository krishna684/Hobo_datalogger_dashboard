// LatestConditions.js
// Renders the latest values for each weather variable

const VARS = [
  { key: 'airTemperature', label: 'Air Temp', unit: '°C' },
  { key: 'dewPoint', label: 'Dew Point', unit: '°C' },
  { key: 'relativeHumidity', label: 'Rel. Humidity', unit: '%' },
  { key: 'windSpeed', label: 'Wind Speed', unit: 'm/s' },
  { key: 'gustSpeed', label: 'Gust Speed', unit: 'm/s' },
  { key: 'windDirection', label: 'Wind Dir', unit: '°' },
  { key: 'pressure', label: 'Pressure', unit: 'mbar' },
];

export default function LatestConditions(root, data) {
  if (!data || !data.length) {
    root.innerHTML = '<div>No data available.</div>';
    return;
  }
  const latest = data[data.length - 1];
  root.innerHTML = `
    <table style="width:100%; border-collapse:collapse;">
      <thead><tr><th>Variable</th><th>Value</th><th>Unit</th><th>Timestamp</th></tr></thead>
      <tbody>
        ${VARS.map(v => `
          <tr>
            <td>${v.label}</td>
            <td>${latest[v.key] != null ? latest[v.key].toFixed(2) : '--'}</td>
            <td>${v.unit}</td>
            <td>${latest.timestamp.replace('T',' ').slice(0,19)}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;
}
