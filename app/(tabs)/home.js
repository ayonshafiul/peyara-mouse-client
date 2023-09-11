import { StyleSheet, Text, View } from "react-native";
import React, { useEffect, useState } from "react";
import { Link } from "expo-router";
import { getServers } from "../../utils/servers";

export default function Home() {
  const [serverList, setServerList] = useState([]);

  useEffect(() => {
    getServers().then((res) => {
      setServerList(res);
    });
  }, []);
  return (
    <View>
      <Link href="qrcode">
        <Text>Home</Text>
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({});
