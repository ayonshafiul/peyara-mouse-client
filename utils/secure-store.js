import * as SecureStore from "expo-secure-store";

export async function setValueFor(key, value) {
  await SecureStore.setItemAsync(key, value);
}

export async function getValueFor(key) {
  let result = await SecureStore.getItemAsync(key);
  return result;
}

export async function setBooleanValueFor(key, value) {
  await SecureStore.setItemAsync(key, JSON.stringify({ value: value }));
}

export async function getBooleanValueFor(key) {
  let result = await SecureStore.getItemAsync(key);
  if (result) {
    let parsedValue = JSON.parse(result);
    console.log(parsedValue);
    return parsedValue.value;
  } else {
    return null;
  }
}
