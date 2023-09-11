import * as SecureStore from "expo-secure-store";
import { SERVER_KEY } from "../assets/constants/constants";

async function setValueFor(key, value) {
  await SecureStore.setItemAsync(key, value);
}

async function getValueFor(key) {
  let result = await SecureStore.getItemAsync(key);
  return result;
}

export async function getServers() {
  let servers = await getValueFor(SERVER_KEY);
  if (servers) {
    return JSON.parse(servers);
  } else {
    // initialize store
    await setValueFor(SERVER_KEY, JSON.stringify([]));
    return [];
  }
}

export async function addServer(qrCodeValue) {
  let servers = await getValueFor(SERVER_KEY);
  if (servers) {
    let serversArray = JSON.parse(servers);
    servers.push(qrCodeValue);
    await setValueFor(SERVER_KEY, JSON.stringify(serversArray));
  } else {
    // initialize store with server value
    await setValueFor(SERVER_KEY, JSON.stringify([qrCodeValue]));
  }
}

export async function setServers(serversArray) {
  await setValueFor(SERVER_KEY, JSON.stringify(serversArray));
}
