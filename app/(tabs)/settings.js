import {
  Dimensions,
  FlatList,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import React, { useEffect, useState } from "react";
import global from "../../assets/styles/global";
import { Switch } from "react-native-switch";
import colors from "../../assets/constants/colors";
import {
  getBooleanValueFor,
  getValueFor,
  setBooleanValueFor,
  setValueFor,
} from "../../utils/secure-store";

import Slider from "@react-native-community/slider";

import {
  SETTINGS_TOUCHPAD_SCROLL_SENSITIVITY,
  SETTINGS_TOUCHPAD_SENSITIVITY,
  settingsData,
} from "../../assets/constants/constants";

const width = Dimensions.get("window").width;

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
  const [touchSens, setTouchSens] = useState(1);
  const [scrollSens, setScrollSens] = useState(0.5);

  useEffect(() => {
    (async function getSliderValues() {
      let ts = await getValueFor(SETTINGS_TOUCHPAD_SENSITIVITY);
      let ss = await getValueFor(SETTINGS_TOUCHPAD_SCROLL_SENSITIVITY);
      if (ts) {
        setTouchSens(Number(ts));
      }
      if (ss) {
        setScrollSens(Number(ss));
      }
    })();
  }, []);

  return (
    <SafeAreaView style={global.container}>
      <Text style={styles.settingsHeader}>Settings</Text>
      <FlatList
        data={settingsData}
        ListHeaderComponent={
          <View>
            <Text style={styles.switchCardText}>Touchpad Sensitivity</Text>
            <View style={styles.sliderContainer}>
              <Slider
                style={{ width: width - 16, height: 40 }}
                minimumValue={0}
                maximumValue={5}
                step={0.1}
                value={touchSens}
                maximumTrackTintColor={colors.PRIM_ACCENT}
                onSlidingComplete={async (value) => {
                  await setValueFor(
                    SETTINGS_TOUCHPAD_SENSITIVITY,
                    String(value)
                  );
                }}
              />
            </View>
            <Text style={styles.switchCardText}>Scroll Sensitivity</Text>
            <View style={styles.sliderContainer}>
              <Slider
                style={{ width: width - 16, height: 40 }}
                minimumValue={0}
                maximumValue={2}
                step={0.05}
                value={scrollSens}
                maximumTrackTintColor={colors.PRIM_ACCENT}
                onSlidingComplete={async (value) => {
                  await setValueFor(
                    SETTINGS_TOUCHPAD_SCROLL_SENSITIVITY,
                    String(value)
                  );
                }}
              />
            </View>
          </View>
        }
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
  sliderContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
});
