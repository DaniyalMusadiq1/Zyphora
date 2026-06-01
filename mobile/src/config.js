import Constants from 'expo-constants';
import { Platform } from 'react-native';

// ==========================================
// 👉 STEP 1: SET YOUR IP HERE IF NEEDED
// ==========================================
// If the app fails to connect, find your PC's IPv4 (e.g. 192.168.1.5)
// and paste it below.
// Leave it as null if you want the app to try to find it automatically.
const MANUAL_IP_URL = 'http://192.168.100.84:8000/api'; 
// 
// Example: const MANUAL_IP_URL = 'http://192.168.1.5:8000/api';

// ==========================================
// CONFIG LOGIC
// ==========================================

function expoLanHostname() {
  // This looks at the connection between your phone and the code editor
  const debuggerHost =
    Constants.expoGoConfig?.debuggerHost ??
    Constants.manifest?.debuggerHost ??
    Constants.manifest2?.extra?.expoGo?.debuggerHost;

  if (typeof debuggerHost !== 'string' || !debuggerHost) {
    return null;
  }
  
  // Extract IP (remove port 8081)
  const host = debuggerHost.split(':')[0];
  
  // If it's a tunnel (exp.direct), we can't guess the local API
  if (!host || /ngrok|exp\.direct|tunnel/i.test(host)) {
    return null;
  }
  
  return host;
}

function getApiUrl() {
  // 1. Use Manual IP if provided (Highest Priority)
  if (MANUAL_IP_URL) {
    console.log('🔗 [Config] Using Manual IP:', MANUAL_IP_URL);
    return MANUAL_IP_URL;
  }

  // 2. Try Auto-Detection for Real Devices
  const lan = expoLanHostname();
  if (lan) {
    const url = `http://${lan}:8000/api`;
    console.log('🔗 [Config] Auto-detected LAN IP:', url);
    return url;
  }

  // 3. Fallback for Android Emulator
  if (Platform.OS === 'android') {
    const url = 'http://10.0.2.2:8000/api';
    console.log('🔗 [Config] Using Android Emulator IP:', url);
    return url;
  }

  // 4. Fallback for iOS Simulator / Others
  const url = 'http://127.0.0.1:8000/api';
  console.log('🔗 [Config] Using Default Localhost:', url);
  return url;
}

const config = {
  API_BASE_URL: getApiUrl(),
  ASSETS_BASE_URL: 'https://cdn.zyphora.network/assets', // Assuming placeholder
  WS_URL: 'wss://ws.zyphora.network', // Assuming placeholder
  KYC_PROVIDER_KEY: '',
};

export default config;