// API service for weather data - LI-COR Cloud / HOBOlink API
// This modular version is for reference. The main.js file contains the actual implementation.

/**
 * LI-COR Cloud API Configuration
 * 
 * To connect to your weather station:
 * 1. Log in to LI-COR Cloud (https://cloud.licor.com)
 * 2. Go to Data > API and create a new API token
 * 3. Copy the token and paste it as API_TOKEN below
 * 4. Get your logger serial number from the Devices page
 * 5. Update the LOGGER_SN below
 * 
 * API Documentation: https://api.licor.cloud/v1/docs/
 */

export const API_BASE_URL = 'https://api.licor.cloud/v1/data';
const API_TOKEN = 'YOUR_API_KEY'; // Your token from LI-COR Cloud
const LOGGER_SN = 'YOUR_LOGGER_SERAIL_NUMBER'; // HOBO RX3000 logger serial number

/**
 * Fetch weather data from LI-COR Cloud API v1
 * @param {string} startTime - ISO8601 string
 * @param {string} endTime - ISO8601 string
 * @returns {Promise<Array>} Array of weather data objects
 */
export async function fetchWeatherData(startTime, endTime) {
  if (API_BASE_URL && API_TOKEN) {
    // Format datetime as YYYY-MM-DD HH:MM:SS in UTC
    const formatDateTime = (isoString) => {
      const date = new Date(isoString);
      const pad = (n) => n.toString().padStart(2, '0');
      // Use UTC methods to ensure correct timezone
      return `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(date.getUTCDate())} ${pad(date.getUTCHours())}:${pad(date.getUTCMinutes())}:${pad(date.getUTCSeconds())}`;
    };
    
    const params = new URLSearchParams({
      loggers: LOGGER_SN,
      start_date_time: formatDateTime(startTime),
      end_date_time: formatDateTime(endTime)
    });
    
    const url = `${API_BASE_URL}?${params.toString()}`;
    
    const res = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${API_TOKEN}`,
        'Accept': 'application/json'
      }
    });
    
    if (!res.ok) {
      throw new Error(`API error: ${res.status} ${res.statusText}`);
    }
    
    const apiData = await res.json();
    return transformAPIData(apiData);
  }
  
  throw new Error('API_BASE_URL or API_TOKEN not configured');
}

function transformAPIData(apiData) {
  if (!apiData.data || !Array.isArray(apiData.data)) {
    return [];
  }
  
  // Group readings by timestamp
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
  
  return Object.values(groupedByTime).sort((a, b) => 
    new Date(a.timestamp) - new Date(b.timestamp)
  );
}
