import { StyleSheet, Text, View } from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import { MaterialIcons } from "@expo/vector-icons";
import React from "react";
import { Tabs } from "expo-router";
import colors from "../../assets/constants/colors";
import HomeIcon from "../../assets/icons/HomeIcon";
import ControlsIcon from "../../assets/icons/ControlsIcon";
import SettingsIcon from "../../assets/icons/SettingsIcon";

export default function TabsLayout() {
  return (
    <Tabs
      initialRouteName="home"
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: "rgba(0,0,0, 0.2)",
          borderTopWidth: 0,
          position: "absolute",
          bottom: 0,
          left: 0,
          height: 60,
          shadowColor: "transparent",
        },
        tabBarActiveTintColor: colors.PRIM_ACCENT,
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          href: "/home",
          title: "",
          tabBarIcon: ({ color }) => (
            <View style={styles.iconContainer}>
              <HomeIcon color={color} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="touchpad"
        options={{
          href: "/touchpad",
          title: "",
          tabBarIcon: ({ color }) => (
            <View style={styles.iconContainer}>
              <ControlsIcon color={color} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          href: "/settings",
          title: "",
          tabBarIcon: ({ color }) => (
            <View style={styles.iconContainer}>
              <SettingsIcon color={color} />
            </View>
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  iconContainer: {
    alignItems: "center",
    marginTop: 14,
    backgroundColor: "transparent",
    minWidth: 80,
  },
  label: {
    marginBottom: 4,
    fontFamily: "Inter_400Regular",
    fontSize: 12,
  },
});
