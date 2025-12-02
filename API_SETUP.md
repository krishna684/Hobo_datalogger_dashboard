# API Configuration Guide

## LI-COR Cloud / HOBOlink API Setup

Your dashboard is configured to connect to the LI-COR Cloud API (formerly HOBOlink).

### Quick Start

1. **Get Your API Token:**
   - Log in to [LI-COR Cloud](https://cloud.licor.com)
   - Navigate to **Data > API**
   - Click **Add Token**
   - Name your token and click **Create**
   - Copy the generated token

2. **Configure the Dashboard:**
   - Open `src/main.js` (for standalone HTML version)
   - OR open `src/api.js` (for modular ES6 version)
   - Replace the `API_TOKEN` value with your actual token
   - (Optional) Set `DEVICE_ID` to filter data from a specific device

3. **Test the Connection:**
   - Save the file
   - Refresh your browser
   - Check the browser console (F12) for any errors
   - The dashboard should now display real data from your weather station

### API Details

- **Base URL:** `https://api.licor.cloud/v2/data`
- **Authentication:** Bearer token in `Authorization` header
- **Documentation:** https://api.licor.cloud/v2/docs/
- **Available Endpoints:**
  - `GET /v2/data` - Retrieve sensor data
  - `GET /v2/devices` - List your devices

### Query Parameters

- `start_time` - ISO8601 timestamp (e.g., `2025-12-01T00:00:00Z`)
- `end_time` - ISO8601 timestamp
- `device_id` - (Optional) Filter by specific device

### Sensor Name Mapping

The dashboard maps sensor names from the API to dashboard variables. Update `FIELD_MAPPING` in `src/main.js` if your sensor names differ:

```javascript
const FIELD_MAPPING = {
  'Air Temperature': 'airTemperature',
  'Dew Point': 'dewPoint',
  'Relative Humidity': 'relativeHumidity',
  'Wind Speed': 'windSpeed',
  'Gust Speed': 'gustSpeed',
  'Wind Direction': 'windDirection',
  'Pressure': 'pressure'
};
```

### Troubleshooting

**No data showing:**
- Check browser console for errors (F12 > Console tab)
- Verify your API token is correct
- Ensure your device is registered and sending data
- Check that sensor names match the `FIELD_MAPPING`

**CORS errors:**
- The API may not allow browser requests directly
- Consider setting up a proxy server (e.g., using Node.js/Express)
- Or host the dashboard on the same domain as the API

**Authentication errors:**
- Verify the token is valid and not expired
- Check that the token has the correct permissions

### Example API Response

The API typically returns data in this format:

```json
{
  "observations": [
    {
      "timestamp": "2025-12-02T10:30:00Z",
      "sensors": [
        {
          "name": "Air Temperature",
          "value": 15.5,
          "unit": "°C"
        },
        {
          "name": "Relative Humidity",
          "value": 65.2,
          "unit": "%"
        }
      ]
    }
  ]
}
```

The `transformAPIData()` function converts this to the dashboard format.

### Need Help?

- **LI-COR Support:** https://www.licor.com/support/Cloud/home.html
- **HOBO Help Center:** https://www.onsetcomp.com/help-center
- **Email:** envsupport@licor.com
