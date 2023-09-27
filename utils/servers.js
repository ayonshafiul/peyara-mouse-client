import {
  QRCODE_SECRET,
  SERVER_REST_RESPONSE,
  SERVER_KEY,
} from "../assets/constants/constants";
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

function sleep(time) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve();
    }, time);
  });
}

export async function addServer(qrCodeValue) {
  let servers = await getValueFor(SERVER_KEY);
  if (!qrCodeValue.includes(QRCODE_SECRET)) return false;

  let qrCodeServers = qrCodeValue.split(",");
  if (!qrCodeServers.length > 2) return false;

  let secret = qrCodeServers[0];
  if (secret != QRCODE_SECRET) return false;

  let hostName = qrCodeServers[1];
  let serverEntry = null;
  // try all possible servers to see which works

  for (let i = 2; i < qrCodeServers.length; i++) {
    let url = qrCodeServers[i];
    let result = await Promise.race([fetch(url), sleep(1000)]); // wait for 1 sec to see if the server works
    if (!result) {
      console.log(url, "Did not work");
      continue;
    }
    let resultJson = await result.json();
    if (resultJson == SERVER_REST_RESPONSE) {
      serverEntry = url + QRCODE_SECRET + hostName;
      break;
    }
  }

  if (!serverEntry) return false;

  if (servers) {
    let serversArray = JSON.parse(servers);
    serversArray.unshift(serverEntry);
    await setValueFor(SERVER_KEY, JSON.stringify(serversArray));
  } else {
    // initialize store with server value
    await setValueFor(SERVER_KEY, JSON.stringify([serverEntry]));
  }
  return true;
}

export async function setServers(serversArray) {
  await setValueFor(SERVER_KEY, JSON.stringify(serversArray));
}
