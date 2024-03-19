import {Alert} from 'react-native';
import {
  QRCODE_SECRET,
  SERVER_REST_RESPONSE,
  SERVER_KEY,
} from '../assets/constants/constants';
import {getValueFor, setValueFor} from './secure-store';

export function getServers() {
  let servers = getValueFor(SERVER_KEY);
  if (servers) {
    try {
      let parsedServers = JSON.parse(servers);
      return parsedServers;
    } catch (e) {
      setValueFor(SERVER_KEY, JSON.stringify([]));
      return [];
    }
  } else {
    // initialize store
    setValueFor(SERVER_KEY, JSON.stringify([]));
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
  let flag = true;
  if (!qrCodeValue) {
    flag = false;
  }
  let servers = getValueFor(SERVER_KEY);
  if (!qrCodeValue.includes(QRCODE_SECRET)) {
    flag = false;
  }

  let qrCodeServers = qrCodeValue.split(',');
  if (!(qrCodeServers.length > 2)) {
    flag = false;
  }

  let secret = qrCodeServers[0];
  if (secret !== QRCODE_SECRET) {
    flag = false;
  }

  let hostName = qrCodeServers[1];
  let serverEntry = null;
  // try all possible servers to see which works

  for (let i = 2; i < qrCodeServers.length; i++) {
    let url = qrCodeServers[i];
    // Alert.alert(url, 'url');
    try {
      let result = await Promise.race([fetch(url), sleep(1000)]); // wait for 1 sec to see if the server works

      if (!result) {
        console.log(url, 'Did not work');
        continue;
      }
      let resultJson = await result.json();
      console.log(resultJson);
      if (resultJson == SERVER_REST_RESPONSE) {
        serverEntry = url + QRCODE_SECRET + hostName;
        break;
      }
    } catch (e) {
      console.log(e, 'error');
    }
  }
  if (!serverEntry) {
    flag = false;
  }

  if (servers) {
    try {
      let serversArray = JSON.parse(servers);
      serversArray.unshift(serverEntry);
      setValueFor(SERVER_KEY, JSON.stringify(serversArray));
    } catch (e) {
      flag = false;
      setValueFor(SERVER_KEY, JSON.stringify([]));
    }
  } else {
    // initialize store with server value
    setValueFor(SERVER_KEY, JSON.stringify([serverEntry]));
  }
  return flag;
}

export function setServers(serversArray) {
  setValueFor(SERVER_KEY, JSON.stringify(serversArray));
}
