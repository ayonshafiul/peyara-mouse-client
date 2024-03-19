import React from 'react';

import {createNativeStackNavigator} from '@react-navigation/native-stack';
import Onboarding from '../screens/Onboarding';
import QRCode from '../screens/QRCode';
import TabsNavigator from './TabNavigator';

const Stack = createNativeStackNavigator();

export default function RootNavigator({initialRoute}) {
  return (
    <Stack.Navigator
      initialRouteName={initialRoute}
      screenOptions={{
        headerShown: false,
      }}>
      <Stack.Screen name="Onboarding" component={Onboarding} />
      <Stack.Screen name="QRCode" component={QRCode} />
      <Stack.Screen name="Tabs" component={TabsNavigator} />
      {/*<Stack.Screen name="Profile" component={Profile} />
      <Stack.Screen name="Settings" component={Settings} /> */}
    </Stack.Navigator>
  );
}
