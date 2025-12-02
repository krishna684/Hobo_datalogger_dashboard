// Thermometer.js
// Renders a thermometer-style widget for air temperature

export default function Thermometer(root, data) {
  if (!data || !data.length) {
    root.innerHTML = '<div>No data</div>';
    return;
  }
  const latest = data[data.length - 1];
  const temp = latest.airTemperature;
  // Clamp for display
  const min = -20, max = 50;
  const percent = Math.max(0, Math.min(1, (temp - min) / (max - min)));
  root.innerHTML = `
    <div class="thermometer">
      <div class="thermometer-bar">
        <div class="thermometer-fill" style="height:${percent*100}%"></div>
      </div>
      <div class="thermometer-bulb"></div>
      <div style="margin-top:8px;font-size:1.5rem;">${temp.toFixed(1)}°C</div>
    </div>
  `;
}
