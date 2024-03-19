import {MMKV} from 'react-native-mmkv';

export const storage = new MMKV();

export async function setValueFor(key, value) {
  await storage.set(key, value);
}

export async function getValueFor(key) {
  let result = await storage.getString(key);
  return result;
}

export async function setBooleanValueFor(key, value) {
  await storage.set(key, value);
}

export async function getBooleanValueFor(key) {
  let result = await storage.getBoolean(key);
  return result;
}
