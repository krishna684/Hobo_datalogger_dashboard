// TimeSeriesChart.js
// Renders a line chart for a given variable using Chart.js

/**
 * @param {string} canvasId - The id of the canvas element
 * @param {Array} data - Array of weather data objects
 * @param {string} varKey - Key of the variable to plot
 * @param {string} label - Label for the chart
 * @param {string} color - Line color
 */
export default function TimeSeriesChart(canvasId, data, varKey, label, color) {
  if (!window.Chart) {
    // Load Chart.js dynamically if not loaded
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/chart.js';
    script.onload = () => TimeSeriesChart(canvasId, data, varKey, label, color);
    document.head.appendChild(script);
    return;
  }
  const ctx = document.getElementById(canvasId);
  if (!ctx) return;
  if (ctx.chartInstance) {
    ctx.chartInstance.destroy();
  }
  const chart = new window.Chart(ctx, {
    type: 'line',
    data: {
      labels: data.map(d => d.timestamp.replace('T',' ').slice(0,19)),
      datasets: [{
        label,
        data: data.map(d => d[varKey]),
        borderColor: color,
        backgroundColor: color + '33',
        pointRadius: 0,
        fill: true,
        tension: 0.2,
      }],
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: false },
        tooltip: { enabled: true },
      },
      scales: {
        x: { display: false },
        y: { beginAtZero: false, title: { display: true, text: label } },
      },
    },
  });
  ctx.chartInstance = chart;
}
