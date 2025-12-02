// main.js - Non-module version for file:// protocol
// API service - LI-COR Cloud / HOBOlink API Configuration
const API_BASE_URL = 'https://api.licor.cloud/v1/data'; // LI-COR Cloud API endpoint
const API_TOKEN = 'YOUR_API_KEY'; // Your API token from LI-COR Cloud
const DEVICE_ID = 'YOUR_DEVICE_SERIAL_NUMBER'; // HOBO RX3000 Weather Station - Columbia, MO

// Field mapping from API response to dashboard variables
// Matches the actual sensor names from your HOBO RX3000
const FIELD_MAPPING = {
  'Temperature': 'airTemperature',
  'Air Temperature': 'airTemperature',
  'Dew Point': 'dewPoint',
  'RH': 'relativeHumidity',
  'Relative Humidity': 'relativeHumidity',
  'Wind Speed': 'windSpeed',
  'Gust': 'gustSpeed',
  'Gust Speed': 'gustSpeed',
  'Wind Direction': 'windDirection',
  'Pressure': 'pressure'
};

async function fetchWeatherData(startTime, endTime) {
  if (API_BASE_URL && API_TOKEN) {
    try {
      console.log('Attempting to fetch from API:', API_BASE_URL);
      console.log('Time range:', startTime, 'to', endTime);
      
      // Format datetime as YYYY-MM-DD HH:MM:SS in UTC for v1 API
      const formatDateTime = (isoString) => {
        const date = new Date(isoString);
        const pad = (n) => n.toString().padStart(2, '0');
        // Use UTC methods to get correct time for API
        return `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(date.getUTCDate())} ${pad(date.getUTCHours())}:${pad(date.getUTCMinutes())}:${pad(date.getUTCSeconds())}`;
      };
      
      // Build API URL with v1 parameters
      const params = new URLSearchParams({
        loggers: DEVICE_ID,
        start_date_time: formatDateTime(startTime),
        end_date_time: formatDateTime(endTime)
      });
      
      const url = `${API_BASE_URL}?${params.toString()}`;
      console.log('Full URL:', url);
      
      // Fetch data with Bearer token authentication
      const res = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${API_TOKEN}`,
          'Accept': 'application/json'
        }
      });
      
      console.log('API Response status:', res.status, res.statusText);
      
      if (!res.ok) {
        const errorText = await res.text();
        console.error('API error response:', errorText);
        throw new Error(`API error: ${res.status} ${res.statusText} - ${errorText}`);
      }
      
      const apiData = await res.json();
      console.log('API Response data:', apiData);
      
      // Transform API response to dashboard format
      const transformed = transformAPIData(apiData);
      console.log('Transformed data:', transformed);
      
      if (transformed.length > 0) {
        console.log('✅ Successfully fetched', transformed.length, 'data points from API');
        return transformed;
      } else {
        console.warn('⚠️ API returned no data');
        throw new Error('No data returned from API');
      }
    } catch (error) {
      console.error('❌ API fetch failed:', error.message);
      console.error('Full error:', error);
      throw error; // Don't fall back - show the error
    }
  } else {
    throw new Error('API_BASE_URL or API_TOKEN not configured');
  }
}

// Transform LI-COR Cloud API v1 response to dashboard format
function transformAPIData(apiData) {
  console.log('Transforming API data:', apiData);
  
  // v1 API returns: { data: [...], max_results: false, message: "..." }
  if (!apiData.data || !Array.isArray(apiData.data)) {
    console.warn('Unexpected API response format:', apiData);
    return [];
  }
  
  // Group readings by timestamp since each sensor has a separate entry
  const groupedByTime = {};
  
  apiData.data.forEach(reading => {
    const timestamp = reading.timestamp;
    if (!groupedByTime[timestamp]) {
      groupedByTime[timestamp] = {
        timestamp: timestamp,
        airTemperature: null,
        dewPoint: null,
        relativeHumidity: null,
        windSpeed: null,
        gustSpeed: null,
        windDirection: null,
        pressure: null
      };
    }
    
    // Map sensor_measurement_type to dashboard fields
    const sensorType = reading.sensor_measurement_type;
    const value = parseFloat(reading.value);
    
    if (sensorType === 'Temperature') {
      groupedByTime[timestamp].airTemperature = value;
    } else if (sensorType === 'Dew Point') {
      groupedByTime[timestamp].dewPoint = value;
    } else if (sensorType === 'RH') {
      groupedByTime[timestamp].relativeHumidity = value;
    } else if (sensorType === 'Wind Speed') {
      groupedByTime[timestamp].windSpeed = value;
    } else if (sensorType === 'Gust Speed') {
      groupedByTime[timestamp].gustSpeed = value;
    } else if (sensorType === 'Wind Direction') {
      groupedByTime[timestamp].windDirection = value;
    } else if (sensorType === 'Pressure') {
      groupedByTime[timestamp].pressure = value;
    }
  });
  
  // Convert grouped data to array and sort by timestamp
  const transformed = Object.values(groupedByTime).sort((a, b) => 
    new Date(a.timestamp) - new Date(b.timestamp)
  );
  
  console.log('✅ Transformed', transformed.length, 'data points');
  if (transformed.length > 0) {
    console.log('Sample data point:', transformed[0]);
  }
  return transformed;
}

// Components
function LatestConditions(root, data) {
  const VARS = [
    { key: 'airTemperature', label: 'Air Temp', unit: '°C' },
    { key: 'dewPoint', label: 'Dew Point', unit: '°C' },
    { key: 'relativeHumidity', label: 'Rel. Humidity', unit: '%' },
    { key: 'windSpeed', label: 'Wind Speed', unit: 'm/s' },
    { key: 'gustSpeed', label: 'Gust Speed', unit: 'm/s' },
    { key: 'windDirection', label: 'Wind Dir', unit: '°' },
    { key: 'pressure', label: 'Pressure', unit: 'mbar' },
  ];
  if (!data || !data.length) {
    root.innerHTML = '<div>No data available.</div>';
    return;
  }
  const latest = data[data.length - 1];
  
  // Convert UTC timestamp to local time (CST/CDT)
  const formatLocalTime = (utcTimestamp) => {
    const date = new Date(utcTimestamp);
    return date.toLocaleString('en-US', { 
      timeZone: 'America/Chicago',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    }).replace(',', '');
  };
  
  root.innerHTML = `
    <table style="width:100%; border-collapse:collapse; color:#f3f4f6;">
      <thead><tr><th style="padding:0.5rem;text-align:left;">Variable</th><th style="padding:0.5rem;text-align:left;">Value</th><th style="padding:0.5rem;text-align:left;">Unit</th><th style="padding:0.5rem;text-align:left;">Timestamp (CST)</th></tr></thead>
      <tbody>
        ${VARS.map(v => `
          <tr style="border-top:1px solid #333a47;">
            <td style="padding:0.5rem;">${v.label}</td>
            <td style="padding:0.5rem;">${latest[v.key] != null ? latest[v.key].toFixed(2) : '--'}</td>
            <td style="padding:0.5rem;">${v.unit}</td>
            <td style="padding:0.5rem;">${formatLocalTime(latest.timestamp)}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;
}

function TimeSeriesChart(canvasId, data, varKey, label, color) {
  const ctx = document.getElementById(canvasId);
  if (!ctx) return;
  if (ctx.chartInstance) {
    ctx.chartInstance.destroy();
  }
  const chart = new Chart(ctx, {
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
      maintainAspectRatio: true,
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

function Thermometer(root, data) {
  if (!data || !data.length) {
    root.innerHTML = '<div>No data</div>';
    return;
  }
  const latest = data[data.length - 1];
  const temp = latest.airTemperature;
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

function getWindRoseBins(data) {
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

function WindRose(canvasId, data) {
  const LABELS = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  const COLORS = ['#60a5fa','#38bdf8','#34d399','#fbbf24','#f87171','#a78bfa','#f472b6','#facc15'];
  const ctx = document.getElementById(canvasId);
  if (!ctx) return;
  if (ctx.chartInstance) ctx.chartInstance.destroy();
  const bins = getWindRoseBins(data);
  ctx.chartInstance = new Chart(ctx, {
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
      maintainAspectRatio: true,
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

function TimeRangeSelector(root, selected, ranges, onChange) {
  const now = new Date();
  const formatDateTimeLocal = (date) => {
    const pad = (n) => n.toString().padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
  };
  
  root.innerHTML = `<div class="time-range-selector">
    ${ranges.map(r => `<button class="time-range-btn${selected===r.value && !state.customDateRange?' selected':''}" data-value="${r.value}">${r.label}</button>`).join('')}
    <button class="time-range-btn${state.customDateRange?' selected':''}" id="custom-range-btn">Custom</button>
    ${state.customDateRange ? '<button class="time-range-btn" id="back-to-live-btn" style="background: #34d399; color: #000;">🔴 Back to Live</button>' : ''}
  </div>
  <div id="custom-date-picker" style="display: ${state.customDateRange ? 'block' : 'none'}; margin-top: 1rem; padding: 1rem; background: #1e293b; border-radius: 8px;">
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
      <div>
        <label style="display: block; margin-bottom: 0.5rem; color: #94a3b8; font-size: 0.875rem;">Start Date & Time</label>
        <input type="datetime-local" id="start-datetime" value="${state.customStartDate || formatDateTimeLocal(new Date(now.getTime() - 24*60*60*1000))}" style="width: 100%; padding: 0.5rem; background: #0f172a; border: 1px solid #334155; border-radius: 4px; color: #f3f4f6; font-size: 0.875rem;" />
      </div>
      <div>
        <label style="display: block; margin-bottom: 0.5rem; color: #94a3b8; font-size: 0.875rem;">End Date & Time</label>
        <input type="datetime-local" id="end-datetime" value="${state.customEndDate || formatDateTimeLocal(now)}" style="width: 100%; padding: 0.5rem; background: #0f172a; border: 1px solid #334155; border-radius: 4px; color: #f3f4f6; font-size: 0.875rem;" />
      </div>
    </div>
    <button id="apply-custom-range" style="margin-top: 1rem; padding: 0.5rem 1.5rem; background: #3b82f6; color: white; border: none; border-radius: 4px; cursor: pointer; font-weight: 500;">Apply</button>
  </div>`;
  
  root.querySelectorAll('.time-range-btn[data-value]').forEach(btn => {
    btn.onclick = () => {
      state.customDateRange = false;
      onChange(Number(btn.dataset.value));
    };
  });
  
  const customBtn = root.querySelector('#custom-range-btn');
  const customPicker = root.querySelector('#custom-date-picker');
  if (customBtn) {
    customBtn.onclick = () => {
      state.customDateRange = true;
      customPicker.style.display = 'block';
      root.querySelectorAll('.time-range-btn[data-value]').forEach(b => b.classList.remove('selected'));
      customBtn.classList.add('selected');
    };
  }
  
  const applyBtn = root.querySelector('#apply-custom-range');
  if (applyBtn) {
    applyBtn.onclick = () => {
      const startInput = root.querySelector('#start-datetime');
      const endInput = root.querySelector('#end-datetime');
      if (startInput && endInput) {
        state.customStartDate = startInput.value;
        state.customEndDate = endInput.value;
        loadCustomData();
      }
    };
  }
  
  const backToLiveBtn = root.querySelector('#back-to-live-btn');
  if (backToLiveBtn) {
    backToLiveBtn.onclick = () => {
      state.customDateRange = false;
      state.customStartDate = null;
      state.customEndDate = null;
      state.timeRange = 24;
      loadData();
    };
  }
}

// App
const TIME_RANGES = [
  { label: '1 h', value: 1 },
  { label: '6 h', value: 6 },
  { label: '12 h', value: 12 },
  { label: '24 h', value: 24 },
];

let state = {
  data: [],
  timeRange: 24,
  loading: true,
  error: null,
  customDateRange: false,
  customStartDate: null,
  customEndDate: null,
};

function rerender() {
  const root = document.getElementById('root');
  const modeIndicator = state.customDateRange 
    ? '<span style="color: #fbbf24; font-size: 0.9rem; margin-left: 1rem;">📅 Custom Time Range</span>'
    : '<span style="color: #34d399; font-size: 0.9rem; margin-left: 1rem;">🔴 LIVE (Auto-refresh: 5 min)</span>';
  root.innerHTML = `
    <div class="header">Weather Station Dashboard ${modeIndicator}</div>
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
}

function onTimeRangeChange(hours) {
  state.timeRange = hours;
  state.customDateRange = false; // Reset to live mode
  state.customStartDate = null;
  state.customEndDate = null;
  loadData();
}

function showError(message) {
  const root = document.getElementById('root');
  root.innerHTML = `
    <div class="header">Weather Station Dashboard</div>
    <div style="padding: 2rem; text-align: center; color: #f87171;">
      <h2>⚠️ Error Loading Data</h2>
      <p style="font-size: 1.2rem; margin: 1rem 0;">${message}</p>
      <p>Check the browser console (F12) for details.</p>
      <p style="margin-top: 2rem; color: #90cdf4;">
        Make sure:<br>
        • Your API token is valid<br>
        • Your device is registered and sending data<br>
        • You have network connectivity<br>
        • The API endpoint is accessible
      </p>
      <button onclick="location.reload()" style="margin-top: 2rem; padding: 0.75rem 1.5rem; background: #3b82f6; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 1rem; font-weight: 500;">Reload Dashboard</button>
    </div>
  `;
}

async function loadCustomData() {
  if (!state.customStartDate || !state.customEndDate) return;
  
  state.loading = true;
  state.error = null;
  const start = new Date(state.customStartDate);
  const end = new Date(state.customEndDate);
  
  try {
    state.data = await fetchWeatherData(start.toISOString(), end.toISOString());
    state.error = null;
  } catch (e) {
    state.error = e.message;
    state.data = [];
    console.error('Failed to load custom data:', e);
    showError(e.message);
    state.loading = false;
    return;
  }
  state.loading = false;
  rerender();
}

async function loadData() {
  state.loading = true;
  state.error = null;
  const end = new Date();
  const start = new Date(end.getTime() - state.timeRange * 60 * 60 * 1000);
  try {
    state.data = await fetchWeatherData(start.toISOString(), end.toISOString());
    state.error = null;
  } catch (e) {
    state.error = e.message;
    state.data = [];
    console.error('Failed to load data:', e);
    showError(e.message);
    state.loading = false;
    return;
  }
  state.loading = false;
  rerender();
}

// Initialize
loadData();
// Auto-refresh every 5 minutes (only in live mode)
setInterval(() => {
  if (!state.customDateRange) {
    console.log('🔄 Auto-refreshing live data...');
    loadData();
  }
}, 5 * 60 * 1000);
