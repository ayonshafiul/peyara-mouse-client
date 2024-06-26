import React from 'react';

import {createNativeStackNavigator} from '@react-navigation/native-stack';
import Touchpad from '../screens/Touchpad';
import Help from '../screens/Help';

const Stack = createNativeStackNavigator();

export default function TouchpadNavigator() {
  return (
    <Stack.Navigator
      initialRouteName={'TouchpadScreen'}
      screenOptions={{
        headerShown: false,
      }}>
      <Stack.Screen name="TouchpadScreen" component={Touchpad} />
      <Stack.Screen name="TouchpadHelp" component={Help} />
    </Stack.Navigator>
  );
}
