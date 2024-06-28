import {
  Dimensions,
  FlatList,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import global from '../assets/styles/global';
import {Switch} from 'react-native-switch';
import colors from '../assets/constants/colors';
import {
  getBooleanValueFor,
  getValueFor,
  setBooleanValueFor,
  setValueFor,
} from '../utils/storage';

import Slider from '@react-native-community/slider';

import {
  SETTINGS_TOUCHPAD_SCROLL_SENSITIVITY,
  SETTINGS_TOUCHPAD_SENSITIVITY,
  SETTINGS_TOUCHPAD_RESPONSE_RATE,
  settingsData,
} from '../assets/constants/constants';
import Background from '../components/Background';

const width = Dimensions.get('window').width;

function SwitchCard({item}) {
  const [isOn, setIsOn] = useState(false);

  useEffect(() => {
    const res = getBooleanValueFor(item?.key);
    setIsOn(res);
  }, []);
  const handleChange = isOn => {
    setIsOn(isOn);
    setBooleanValueFor(item?.key, isOn);
  };

  return (
    <TouchableOpacity
      onPress={() => handleChange(!isOn)}
      style={styles.switchCardContainer}
      activeOpacity={0.8}>
      <Text style={styles.switchCardText}>{item?.label}</Text>
      <Switch
        value={isOn}
        onValueChange={handleChange}
        renderActiveText={false}
        renderInActiveText={false}
        circleSize={20}
        backgroundActive={colors.PRIM_ACCENT}
      />
    </TouchableOpacity>
  );
}

export default function Settings() {
  const [touchSens, setTouchSens] = useState(1);
  const [scrollSens, setScrollSens] = useState(0.5);
  const [responseRate, setResponseRate] = useState(16);

  useEffect(() => {
    (async function getSliderValues() {
      let ts = getValueFor(SETTINGS_TOUCHPAD_SENSITIVITY);
      let ss = getValueFor(SETTINGS_TOUCHPAD_SCROLL_SENSITIVITY);
      if (ts) {
        setTouchSens(Number(ts));
      }
      if (ss) {
        setScrollSens(Number(ss));
      }
    })();
  }, []);

  return (
    <Background>
      <Text style={styles.settingsHeader}>Settings</Text>
      <FlatList
        data={settingsData}
        ListHeaderComponent={
          <>
            <Text style={styles.switchCardText}>
              Touchpad Sensitivity : {touchSens.toFixed(2)}
            </Text>
            <View style={styles.sliderContainer}>
              <Slider
                style={styles.slider}
                minimumValue={0.05}
                maximumValue={5}
                step={0.05}
                value={touchSens}
                onValueChange={setTouchSens}
                maximumTrackTintColor={colors.PRIM_ACCENT}
                minimumTrackTintColor={colors.PRIM_ACCENT}
                thumbTintColor={colors.PRIM_ACCENT}
                onSlidingComplete={async value => {
                  setValueFor(SETTINGS_TOUCHPAD_SENSITIVITY, String(value));
                }}
              />
            </View>
            <Text style={styles.switchCardText}>
              Scroll Sensitivity: {scrollSens.toFixed(2)}
            </Text>
            <View style={styles.sliderContainer}>
              <Slider
                style={styles.slider}
                minimumValue={0.05}
                maximumValue={2}
                step={0.05}
                value={scrollSens}
                onValueChange={setScrollSens}
                maximumTrackTintColor={colors.PRIM_ACCENT}
                minimumTrackTintColor={colors.PRIM_ACCENT}
                thumbTintColor={colors.PRIM_ACCENT}
                onSlidingComplete={async value => {
                  setValueFor(
                    SETTINGS_TOUCHPAD_SCROLL_SENSITIVITY,
                    String(value),
                  );
                }}
              />
            </View>
            <Text style={styles.switchCardText}>
              Touchpad Respoinse rate: {responseRate}ms
            </Text>
            <View style={styles.sliderContainer}>
              <Slider
                style={styles.slider}
                minimumValue={4}
                maximumValue={120}
                step={4}
                value={responseRate}
                onValueChange={setResponseRate}
                maximumTrackTintColor={colors.PRIM_ACCENT}
                minimumTrackTintColor={colors.PRIM_ACCENT}
                thumbTintColor={colors.PRIM_ACCENT}
                onSlidingComplete={async value => {
                  setValueFor(SETTINGS_TOUCHPAD_RESPONSE_RATE, String(value));
                }}
              />
            </View>
          </>
        }
        renderItem={props => <SwitchCard {...props} />}
      />
    </Background>
  );
}

const styles = StyleSheet.create({
  switchCardContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderColor: colors.WHITE,
  },
  switchCardText: {
    color: colors.WHITE,
    fontFamily: 'Raleway-Regular',
  },
  settingsHeader: {
    color: colors.WHITE,
    fontSize: 18,
    marginVertical: 24,
    fontFamily: 'Raleway-Bold',
  },
  sliderContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  slider: {width: width - 32, height: 40},
});
