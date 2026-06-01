import axios from 'axios';
import Config from '../config'; // Ensure this path is correct based on your folder structure

let getAuthToken = () => null;

export function setAuthTokenGetter(fn) {
  getAuthToken = fn;
}

let getDeviceId = () => null;

export function setDeviceIdGetter(fn) {
  getDeviceId = fn;
}

const api = axios.create({
  baseURL: Config.API_BASE_URL,
  timeout: 15000, // Increased timeout slightly
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
});

// Request Interceptor
api.interceptors.request.use(
  (config) => {
    const token = getAuthToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    const deviceId = getDeviceId();
    if (deviceId) {
      config.headers['X-Device-Id'] = deviceId;
    }
    console.log(`➡️ [API] ${config.method.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor (for debugging)
api.interceptors.response.use(
  (response) => {
    console.log(`✅ [API] ${response.config.url} - Status: ${response.status}`);
    return response;
  },
  (error) => {
    console.error(
      `❌ [API] Error:`,
      error.response ? error.response.data : error.message
    );
    // If it's a network error, the request didn't hit the backend
    if (!error.response && error.message === 'Network Error') {
      console.error('🚨 Network Error: Check your WiFi/IP. Ensure backend is running and URL is correct.');
    }
    return Promise.reject(error);
  }
);

export default api;