/**
 * @format
 */
import { backgroundNotification } from "@actions";
import { AppRegistry } from 'react-native';
import App from './app/App';
import { name as appName } from './app/app.json';
AppRegistry.registerHeadlessTask('ReactNativeFirebaseMessagingHeadlessTask', () => backgroundNotification);
AppRegistry.registerComponent(appName, () => App);