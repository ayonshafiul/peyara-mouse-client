import { StyleSheet, Text, View } from "react-native";
import React from "react";
import { Link } from "expo-router";

export default function Home() {
  return (
    <View>
      <Link href="qrcode">
        <Text>Home</Text>
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({});
