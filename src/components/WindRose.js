// WindRose.js
// Renders a wind rose using Chart.js polarArea chart

function getWindRoseBins(data) {
  // 8 compass bins: N, NE, E, SE, S, SW, W, NW
  const bins = Array(8).fill(0);
  data.forEach(d => {
    const dir = d.windDirection;
    const speed = d.windSpeed;
    if (dir == null || speed == null) return;
    const idx = Math.floor(((dir + 22.5) % 360) / 45);
    bins[idx] += speed;
  });
  return bins;
}

const LABELS = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
const COLORS = ['#60a5fa','#38bdf8','#34d399','#fbbf24','#f87171','#a78bfa','#f472b6','#facc15'];

export default function WindRose(canvasId, data) {
  if (!window.Chart) {
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/chart.js';
    script.onload = () => WindRose(canvasId, data);
    document.head.appendChild(script);
    return;
  }
  const ctx = document.getElementById(canvasId);
  if (!ctx) return;
  if (ctx.chartInstance) ctx.chartInstance.destroy();
  const bins = getWindRoseBins(data);
  ctx.chartInstance = new window.Chart(ctx, {
    type: 'polarArea',
    data: {
      labels: LABELS,
      datasets: [{
        label: 'Wind Speed (m/s)',
        data: bins,
        backgroundColor: COLORS,
      }],
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: true },
        tooltip: { enabled: true },
      },
      scales: {
        r: { beginAtZero: true, title: { display: true, text: 'Wind Speed (m/s)' } },
      },
    },
  });
}
