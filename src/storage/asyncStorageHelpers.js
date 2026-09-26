import AsyncStorage from '@react-native-async-storage/async-storage';

export async function getItem(key, fallback = null) {
  try {
    const raw = await AsyncStorage.getItem(key);
    return raw != null ? JSON.parse(raw) : fallback;
  } catch (e) {
    console.warn(`Failed to read ${key}`, e);
    return fallback;
  }
}

export async function setItem(key, value) {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (e) {
    console.warn(`Failed to write ${key}`, e);
    return false;
  }
}

export async function removeItem(key) {
  try {
    await AsyncStorage.removeItem(key);
    return true;
  } catch (e) {
    console.warn(`Failed to remove ${key}`, e);
    return false;
  }
}
