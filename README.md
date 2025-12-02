# HOBO Weather Station Dashboard

A real-time web dashboard for HOBO RX3000 weather stations connected to LI-COR Cloud (formerly HOBOlink). Built with vanilla HTML, CSS, and JavaScript — no build process required: just open the HTML in your browser.

## Table of Contents

- [Features](#-features)
- [Quick Start](#-quick-start)
  - [Option 1: View Demo (No Setup)](#option-1-view-demo-no-setup)
  - [Option 2: Connect Your Own Station](#option-2-connect-your-own-station)
- [Project Structure](#-project-structure)
- [Technical Details](#-technical-details)
  - [API Integration](#api-integration)
  - [Data Transformation](#data-transformation)
  - [Timezone Handling](#timezone-handling)
- [Customization](#-customization)
- [Troubleshooting](#-troubleshooting)
- [Data Verification](#-data-verification)
- [License](#-license)
- [Resources](#-resources)
- [Station Info](#-station-info)

---

## 🎯 Features

### Real-Time Monitoring
- 🟢 Live Mode: Auto-refreshes every 5 minutes with latest weather data
- 📅 Historical Data: Custom date/time picker to view any past time range
- 7 Weather Variables: Temperature, Dew Point, Humidity, Wind Speed, Gust Speed, Wind Direction, Pressure

### Visualizations
- Latest Conditions Table: Current readings with CST/CDT timestamps
- Time-Series Charts: Interactive line charts for all 7 variables (Chart.js)
- Thermometer Widget: Visual temperature display with color gradients
- Wind Rose: Polar chart showing wind speed distribution by direction
- Responsive Layout: Dark-themed grid for desktop, tablet, and mobile

### Time Range Selection
- Quick Presets: 1h, 6h, 12h, 24h buttons
- Custom Range: Pick exact start/end date and time
- Mode Indicator: Shows whether you're viewing live or historical data

---

## 🚀 Quick Start

### Option 1: View Demo (No Setup)
Open the dashboard in your browser:
```bash
# Windows PowerShell example - open the local index.html file
Start-Process "c:\Users\kkffz\hobo_datalogger\public\index.html"
```
> The dashboard is pre-configured with a sample HOBO RX3000 station (Serial: 22429142, Columbia MO) for demo purposes.

### Option 2: Connect Your Own Station

1. Get your API token:
   - Log in to https://cloud.licor.com
   - Go to **Data > API**
   - Click **Add Token** and copy it

2. Update configuration:
   - Open `src/main.js`
   - Replace `API_TOKEN` with your token (do not commit tokens to public repos)
   - Replace `DEVICE_ID` (or `loggers`) with your logger serial number

3. Refresh browser:
   - The dashboard will fetch your station's data automatically

Security note: Do not commit your API token to a public repository; consider using a small server/proxy to store secrets or environment variables.

---

## 📁 Project Structure

```
hobo_datalogger/
├── public/
│   └── index.html              # Main entry point (open this in browser)
├── src/
│   ├── main.js                 # Complete standalone app (no modules)
│   ├── api.js                  # ES6 module reference version
│   ├── styles.css              # Dark theme styling
│   └── components/             # Modular UI components (reference)
├── .github/
│   └── copilot-instructions.md # Project tracking
├── README.md                   # This file
└── API_SETUP.md                # Detailed API documentation
```

---

## 🔧 Technical Details

### API Integration
- Endpoint: `https://api.licor.cloud/v1/data`
- Authentication: Bearer token via Authorization header
- Parameters:
  - `loggers`: Device serial number
  - `start_date_time`: YYYY-MM-DD HH:MM:SS (UTC)
  - `end_date_time`: YYYY-MM-DD HH:MM:SS (UTC)
- Response: JSON with `data[]` array of sensor readings

### Data Transformation
The API returns individual sensor readings. Example:
```json
{
  "logger_sn": "22429142",
  "sensor_sn": "22413849-1",
  "timestamp": "2025-12-01 05:05:00Z",
  "sensor_measurement_type": "Temperature",
  "value": -6.36,
  "unit": "°C"
}
```
The dashboard groups readings by timestamp and maps sensor types to variables used by charts/widgets.

### Timezone Handling
- API timestamps: UTC (with `Z` suffix)
- Dashboard display: America/Chicago (CST/CDT)
- Conversion: JavaScript `Date` with `toLocaleString()` or equivalent

---

## 🎨 Customization

- Change time range defaults by editing `TIME_RANGES` in `src/main.js`:
```javascript
const TIME_RANGES = [
  { label: '30 min', value: 0.5 },
  { label: '1 h', value: 1 },
  { label: '6 h', value: 6 },
  { label: '24 h', value: 24 },
  { label: '7 days', value: 168 },
];
```

- Modify sensor mapping (if station has different sensors) inside the transformation logic in `src/main.js`:
```javascript
if (sensorType === 'Your Custom Sensor Name') {
  groupedByTime[timestamp].customVariable = value;
}
```

- Styling changes: edit `src/styles.css`. The dark theme uses background `#181c24`, cards `#23272f`, and text `#f3f4f6`. Chart color suggestions: Temperature (red), Humidity (blue), Wind (green).

---

## 🐛 Troubleshooting

### No Data / Old Data
1. Check browser console (F12) for errors
2. Verify Live Mode indicator (shows live/historical)
3. Try clicking the "24 h" preset to reset to live mode
4. Verify API Token is valid and not expired

### Timezone Issues
- Dashboard displays times in America/Chicago. API expects UTC in requests.

### CORS Errors
- LI-COR Cloud API allows CORS, but if you encounter CORS issues:
  - Serve `index.html` via a local web server (avoid file://)
  - Use a proxy server if necessary

### Custom Date Picker Not Working
- Click "Apply" after selecting dates
- Click "Back to Live" to return to auto-refreshing mode (custom mode disables auto-refresh)

---

## 📊 Data Verification

This dashboard has been verified against station data:
- ✅ Pressure readings match LI-COR Cloud exactly
- ✅ Timestamps correctly converted from UTC to CST/CDT
- ✅ All 7 sensor types mapped properly
- ✅ 5-minute interval data matches station logging frequency

---

## 📄 License

This is a custom dashboard built for HOBO weather station monitoring. Feel free to modify for your own use. (Add a license file if you want a specific license.)

---

## 🔗 Resources

- LI-COR Cloud: https://cloud.licor.com
- API Documentation: https://api.licor.cloud/v1/docs/
- Chart.js Docs: https://www.chartjs.org/docs/
- HOBO Data Loggers: https://www.onsetcomp.com/products/data-loggers/

---

## 📍 Station Info

HOBO RX3000 | Serial: ******* | Location: Weather1-*****

Notes:
- The LI-COR API may block browser requests or rate limit — consider hosting or using a proxy server if you plan to deploy this publicly.
- Follow API_SETUP.md to connect to your real weather station and ensure the API returns JSON with ISO8601 timestamps and the required sensor measurements.

