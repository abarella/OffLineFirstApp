/**
 * @format
 */

import './src/fcmBackground';

import { AppRegistry, LogBox } from 'react-native';

// Suppress SafeAreaView deprecation warning early
LogBox.ignoreLogs(["SafeAreaView has been deprecated and will be removed in a future release"]);

import App from './App';
import { name as appName } from './app.json';

AppRegistry.registerComponent(appName, () => App);
