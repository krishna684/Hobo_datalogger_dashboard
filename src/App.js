import { fetchWeatherData } from './api.js';
import LatestConditions from './components/LatestConditions.js';
import TimeSeriesChart from './components/TimeSeriesChart.js';
import Thermometer from './components/Thermometer.js';
import WindRose from './components/WindRose.js';
import TimeRangeSelector from './components/TimeRangeSelector.js';

const TIME_RANGES = [
  { label: '1 h', value: 1 },
  { label: '6 h', value: 6 },
  { label: '12 h', value: 12 },
  { label: '24 h', value: 24 },
];

function App(root) {
  let state = {
    data: [],
    timeRange: 24,
    loading: true,
    error: null,
  };

  const rerender = () => {
    root.innerHTML = `
      <div class="header">Weather Station Dashboard</div>
      <div class="dashboard-grid">
        <div class="card">
          <div class="card-header">Latest Conditions</div>
          <div id="latest-conditions"></div>
        </div>
        <div class="card">
          <div class="card-header">Air Temperature</div>
          <canvas id="temp-chart"></canvas>
        </div>
        <div class="card">
          <div class="card-header">Dew Point</div>
          <canvas id="dew-chart"></canvas>
        </div>
        <div class="card">
          <div class="card-header">Relative Humidity</div>
          <canvas id="rh-chart"></canvas>
        </div>
        <div class="card">
          <div class="card-header">Wind Speed</div>
          <canvas id="wind-chart"></canvas>
        </div>
        <div class="card">
          <div class="card-header">Gust Speed</div>
          <canvas id="gust-chart"></canvas>
        </div>
        <div class="card">
          <div class="card-header">Wind Direction</div>
          <canvas id="dir-chart"></canvas>
        </div>
        <div class="card">
          <div class="card-header">Pressure</div>
          <canvas id="pres-chart"></canvas>
        </div>
        <div class="card">
          <div class="card-header">Thermometer</div>
          <div id="thermometer"></div>
        </div>
        <div class="card">
          <div class="card-header">Wind Rose</div>
          <canvas id="windrose"></canvas>
        </div>
        <div class="card">
          <div class="card-header">Time Range</div>
          <div id="time-range-selector"></div>
        </div>
      </div>
    `;
    // Mount subcomponents
    LatestConditions(document.getElementById('latest-conditions'), state.data);
    Thermometer(document.getElementById('thermometer'), state.data);
    TimeRangeSelector(document.getElementById('time-range-selector'), state.timeRange, TIME_RANGES, onTimeRangeChange);
    TimeSeriesChart('temp-chart', state.data, 'airTemperature', 'Air Temp (°C)', '#f87171');
    TimeSeriesChart('dew-chart', state.data, 'dewPoint', 'Dew Point (°C)', '#fbbf24');
    TimeSeriesChart('rh-chart', state.data, 'relativeHumidity', 'Rel. Humidity (%)', '#60a5fa');
    TimeSeriesChart('wind-chart', state.data, 'windSpeed', 'Wind Speed (m/s)', '#34d399');
    TimeSeriesChart('gust-chart', state.data, 'gustSpeed', 'Gust Speed (m/s)', '#a78bfa');
    TimeSeriesChart('dir-chart', state.data, 'windDirection', 'Wind Dir (°)', '#f472b6');
    TimeSeriesChart('pres-chart', state.data, 'pressure', 'Pressure (mbar)', '#facc15');
    WindRose('windrose', state.data);
  };

  function onTimeRangeChange(hours) {
    state.timeRange = hours;
    loadData();
  }

  async function loadData() {
    state.loading = true;
    state.error = null;
    const end = new Date();
    const start = new Date(end.getTime() - state.timeRange * 60 * 60 * 1000);
    try {
      state.data = await fetchWeatherData(start.toISOString(), end.toISOString());
    } catch (e) {
      state.error = e.message;
      state.data = [];
    }
    state.loading = false;
    rerender();
  }

  // Initial load
  loadData();
  // Refresh every 5 minutes
  setInterval(loadData, 5 * 60 * 1000);
}

export default App;
