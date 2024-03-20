/**
 * @format
 */

import {AppRegistry} from 'react-native';
import App from './App';
import {name as appName} from './app.json';
import notifee, {AndroidImportance} from '@notifee/react-native';

// notifee.registerForegroundService(notification => {
//   return new Promise(() => {
//     // Long running task...
//   });
// });

AppRegistry.registerComponent(appName, () => App);
