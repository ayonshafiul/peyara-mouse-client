import { SERVER_KEY } from "../assets/constants/constants";
import { getValueFor, setValueFor } from "./secure-store";

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
    serversArray.push(qrCodeValue);
    await setValueFor(SERVER_KEY, JSON.stringify(serversArray));
  } else {
    // initialize store with server value
    await setValueFor(SERVER_KEY, JSON.stringify([qrCodeValue]));
  }
}

export async function setServers(serversArray) {
  await setValueFor(SERVER_KEY, JSON.stringify(serversArray));
}
