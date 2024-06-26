import {Image, StyleSheet, Text, View} from 'react-native';
import React, {useEffect} from 'react';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSpring,
} from 'react-native-reanimated';

import AppIcon from '../assets/img/mouse.png';
import colors from '../assets/constants/colors';

export default function MouseMove() {
  const offset = useSharedValue(10);

  useEffect(() => {
    offset.value = withRepeat(withSpring(-offset.value), -1, true);
  }, []);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{translateX: offset.value}],
  }));

  return (
    <Animated.View style={styles.mainCardWrapper}>
      <Animated.Image source={AppIcon} style={[styles.icon, animStyle]} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  mainCardWrapper: {
    height: 200,
    padding: 16,
    borderRadius: 4,
    marginVertical: 16,
    backgroundColor: colors.PRIM_ACCENT,
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    width: 80,
    height: 80,
    alignSelf: 'center',
  },
});
