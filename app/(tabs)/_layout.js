import { StyleSheet, Text, View } from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import { MaterialIcons } from "@expo/vector-icons";
import React from "react";
import { Tabs } from "expo-router";

export default function TabsLayout() {
  return (
    <Tabs
      initialRouteName="home"
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: "#1f1f1f",
          borderTopWidth: 0,
        },
        tabBarActiveTintColor: "white",
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          href: "/home",
          title: "",
          tabBarIcon: ({ color }) => (
            <View style={styles.iconContainer}>
              <FontAwesome name="home" size={24} color={color} />
              <Text style={[styles.label, { color: color }]}>Home</Text>
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
              <MaterialIcons name="keyboard" size={24} color={color} />
              <Text style={[styles.label, { color: color }]}>Controls</Text>
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
              <FontAwesome name="gear" size={24} color={color} />
              <Text style={[styles.label, { color: color }]}>Settings</Text>
            </View>
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  iconContainer: {
    flexDirection: "column",
    alignItems: "center",
    marginTop: 14,
    backgroundColor: "transparent",
  },
  label: {
    marginBottom: 4,
  },
});
