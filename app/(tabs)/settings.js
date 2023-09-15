import { FlatList, SafeAreaView, StyleSheet, Text, View } from "react-native";
import React, { useEffect, useState } from "react";
import global from "../../assets/styles/global";
import { Switch } from "react-native-switch";
import colors from "../../assets/constants/colors";
import {
  getBooleanValueFor,
  setBooleanValueFor,
} from "../../utils/secure-store";

import { settingsData } from "../../assets/constants/constants";

function SwitchCard({ item }) {
  const [isOn, setIsOn] = useState(false);

  useEffect(() => {
    getBooleanValueFor(item?.key).then((res) => setIsOn(res));
  }, []);
  const handleChange = (isOn) => {
    setIsOn(isOn);
    setBooleanValueFor(item?.key, isOn);
  };

  return (
    <View style={styles.switchCardContainer}>
      <Text style={styles.switchCardText}>{item?.label}</Text>
      <Switch
        value={isOn}
        onValueChange={handleChange}
        renderActiveText={false}
        renderInActiveText={false}
        circleSize={20}
      />
    </View>
  );
}

export default function Settings() {
  return (
    <SafeAreaView style={global.container}>
      <Text style={styles.settingsHeader}>Settings</Text>
      <FlatList
        data={settingsData}
        renderItem={(props) => <SwitchCard {...props} />}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  switchCardContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
    borderColor: colors.WHITE,
  },
  switchCardText: {
    fontFamily: "Inter_400Regular",
    color: colors.WHITE,
  },
  settingsHeader: {
    fontFamily: "Inter_400Regular",
    color: colors.WHITE,
    fontSize: 24,
    marginVertical: 24,
  },
});
