/**
 * @format
 */

import {AppRegistry} from 'react-native';
import App from './App';
import {name as appName} from './app.json';
import notifee, {AndroidImportance} from '@notifee/react-native';

notifee.registerForegroundService(notification => {
  return new Promise(() => {
    // Long running task...
  });
});
notifee.createChannel({
  id: 'media',
  name: 'Media Controls',
  lights: false,
  vibration: false,
  importance: AndroidImportance.DEFAULT,
});

AppRegistry.registerComponent(appName, () => App);
