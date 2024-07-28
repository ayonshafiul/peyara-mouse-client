import {Alert} from 'react-native';
import {
  QRCODE_SECRET,
  SERVER_REST_RESPONSE,
  SERVER_KEY,
  DESKTOP_APP_VERSION,
} from '../assets/constants/constants';
import {getValueFor, setValueFor} from './storage';

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
  let errorObject = {
    error: false,
    errorTitle: '',
  };

  if (!qrCodeValue) {
    errorObject.error = true;
    errorObject.errorTitle = 'No data found';
    return errorObject;
  }

  let qrCodeServers = qrCodeValue.split(',');
  if (!(qrCodeServers.length > 2)) {
    errorObject.error = true;
    errorObject.errorTitle = 'QRCode seems to be invalid';
    return errorObject;
  }

  let appVersion = qrCodeServers[0]; // first index should be app version
  if (appVersion !== DESKTOP_APP_VERSION) {
    errorObject.error = true;
    errorObject.errorTitle =
      'Please update desktop app to the latest version and try again';
    return errorObject;
  }

  let secret = qrCodeServers[1];
  if (secret !== QRCODE_SECRET) {
    errorObject.error = true;
    errorObject.errorTitle =
      'Make sure to scan the QRcode shown only on Peyara Desktop App';
    return errorObject;
  }

  let hostName = qrCodeServers[2];
  let serverEntry = null;
  // try all possible servers to see which works

  for (let i = 3; i < qrCodeServers.length; i++) {
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
    errorObject.error = true;
    errorObject.errorTitle = "Couldn't connect to server";
    return errorObject;
  }
  let servers = getValueFor(SERVER_KEY);
  if (servers) {
    try {
      let serversArray = JSON.parse(servers);
      serversArray.unshift(serverEntry);
      setValueFor(SERVER_KEY, JSON.stringify(serversArray));
    } catch (e) {
      setValueFor(SERVER_KEY, JSON.stringify([]));
      errorObject.error = true;
      errorObject.errorTitle = "Couldn't save the server url";
      return errorObject;
    }
  } else {
    // initialize store with server value
    setValueFor(SERVER_KEY, JSON.stringify([serverEntry]));
  }
  return {error: false};
}

export function setServers(serversArray) {
  setValueFor(SERVER_KEY, JSON.stringify(serversArray));
}
