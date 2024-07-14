import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import React, {useEffect} from 'react';
import KeepAwakeText from './KeepAwakeText';
import Animated from 'react-native-reanimated';
import {GestureDetector} from 'react-native-gesture-handler';
import colors from '../assets/constants/colors';
import {useNavigation} from '@react-navigation/native';
import {useGlobalStore} from '../store/useGlobalStore';

export default function LandscapeTouchpad({
  composed,
  scrollGesture,
  scrollWheelStyles,
  sendLeftClick,
  sendRightClick,
}) {
  const setShowBottomBar = useGlobalStore(state => state.setShowBottomBar);

  useEffect(() => {
    setShowBottomBar(false);
  }, []);

  return (
    <>
      <Animated.View style={styles.touchpadContainer}>
        <GestureDetector gesture={composed}>
          <Animated.View style={styles.touchpad}></Animated.View>
        </GestureDetector>

        <Animated.View style={styles.scrollWheelContainer}>
          <Animated.View style={styles.scrollWheelTrack}>
            <GestureDetector gesture={scrollGesture}>
              <Animated.View
                style={[styles.scrollWheelThumb, scrollWheelStyles]}>
                <View style={styles.thumbLine} />
                <View style={styles.thumbLine} />
                <View style={styles.thumbLine} />
              </Animated.View>
            </GestureDetector>
          </Animated.View>
        </Animated.View>
      </Animated.View>
      {/* Touchpad */}

      {/* Mouse Buttons */}
      <View style={styles.clicksWrapper}>
        <TouchableOpacity style={styles.clickBtn} onPress={sendLeftClick} />
        <TouchableOpacity style={styles.clickBtn} onPress={sendRightClick} />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  touchpadContainer: {
    position: 'absolute',
    top: 40,
    left: 40,
    right: 0,
    bottom: 40,
    justifyContent: 'space-between',
    flexDirection: 'row',
  },
  touchpad: {
    width: '94%',
    height: '100%',
    borderRadius: 8,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
  },
  scrollWheelContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    width: '6%',
    height: '100%',
  },
  scrollWheelTrack: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 1,
    backgroundColor: colors.WHITE,
    height: '100%',
    left: 4,
    opacity: 0.4,
  },
  scrollWheelThumb: {
    width: 20,
    height: 60,
    backgroundColor: colors.WHITE,
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  thumbLine: {
    width: 12,
    height: 2,
    backgroundColor: colors.PRIM_BG,
    marginVertical: 2,
  },
  clicksWrapper: {
    position: 'absolute',
    top: 40,
    left: 0,
    bottom: 40,
    width: 38,

    justifyContent: 'space-between',
  },
  clickBtn: {
    height: '49.6%',
    borderRadius: 4,
    backgroundColor: colors.WHITE,
    opacity: 0.05,
    justifyContent: 'center',
    alignItems: 'center',
  },
  clickBtnText: {
    fontFamily: 'Raleway-Thin',
    color: colors.WHITE,
  },
});
