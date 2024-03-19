import {MMKV} from 'react-native-mmkv';

export const storage = new MMKV();

export function setValueFor(key, value) {
  storage.set(key, value);
}

export function getValueFor(key) {
  let result = storage.getString(key);
  return result;
}

export function setBooleanValueFor(key, value) {
  storage.set(key, value);
}

export function getBooleanValueFor(key) {
  let result = storage.getBoolean(key);
  return result;
}
