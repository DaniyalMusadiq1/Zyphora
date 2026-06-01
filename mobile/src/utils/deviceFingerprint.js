import * as Application from 'expo-application';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

/**
 * Stable device identifier for Zyphora API headers (react-native-device-info style wrapper via Expo).
 */
export async function getDeviceFingerprint() {
  try {
    if (Platform.OS === 'android') {
      const id = Application.androidId;
      if (id) {
        return id;
      }
    } else {
      const ios = await Application.getIosIdForVendorAsync();
      if (ios) {
        return ios;
      }
    }

    return Constants.installationId || `${Platform.OS}-fallback`;
  } catch {
    return `${Platform.OS}-fallback`;
  }
}
