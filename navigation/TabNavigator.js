import {StyleSheet, Text, View} from 'react-native';
import React from 'react';
import colors from '../assets/constants/colors';
import HomeIcon from '../assets/icons/HomeIcon';
import ControlsIcon from '../assets/icons/ControlsIcon';
import SettingsIcon from '../assets/icons/SettingsIcon';

import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import Home from '../screens/Home';
import Settings from '../screens/Settings';
import Touchpad from '../screens/Touchpad';
import TouchpadNavigator from './TouchpadNavigator';

import {useGlobalStore} from '../store/useGlobalStore';

const Tabs = createBottomTabNavigator();

export default function TabsNavigator() {
  const showBottomBar = useGlobalStore(state => state.showBottomBar);
  return (
    <Tabs.Navigator
      initialRouteName="Home"
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: 'rgba(0,0,0, 0.2)',
          borderTopWidth: 0,
          position: 'absolute',
          bottom: 0,
          left: 0,
          height: showBottomBar ? 60 : 0,
          shadowColor: 'transparent',
        },
        tabBarActiveTintColor: colors.PRIM_ACCENT,
        tabBarHideOnKeyboard: true,
        unmountOnBlur: true,
      }}>
      <Tabs.Screen
        name="Home"
        options={{
          title: '',
          tabBarIcon: ({color}) => (
            <View style={styles.iconContainer}>
              <HomeIcon color={color} />
            </View>
          ),
        }}
        component={Home}
      />
      <Tabs.Screen
        name="Touchpad"
        options={{
          title: '',
          tabBarIcon: ({color}) => (
            <View style={styles.iconContainer}>
              <ControlsIcon color={color} />
            </View>
          ),
        }}
        component={TouchpadNavigator}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: '',
          tabBarIcon: ({color}) => (
            <View style={styles.iconContainer}>
              <SettingsIcon color={color} />
            </View>
          ),
        }}
        component={Settings}
      />
    </Tabs.Navigator>
  );
}

const styles = StyleSheet.create({
  iconContainer: {
    alignItems: 'center',
    marginTop: 14,
    backgroundColor: 'transparent',
    minWidth: 80,
  },
  label: {
    marginBottom: 4,
    fontSize: 12,
  },
});
