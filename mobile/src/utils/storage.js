import AsyncStorage from '@react-native-async-storage/async-storage';

export async function storageGet(key) {
  try {
    return await AsyncStorage.getItem(key);
  } catch {
    return null;
  }
}

export async function storageSet(key, value) {
  await AsyncStorage.setItem(key, value);
}

export async function storageRemove(key) {
  await AsyncStorage.removeItem(key);
}
