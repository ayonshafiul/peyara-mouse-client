import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import React from 'react';
import KeepAwakeText from './KeepAwakeText';
import Animated from 'react-native-reanimated';
import {GestureDetector} from 'react-native-gesture-handler';
import colors from '../assets/constants/colors';

export default function PortraitTouchpad({
  composed,
  scrollGesture,
  scrollWheelStyles,
  sendLeftClick,
  sendRightClick,
}) {
  return (
    <>
      <Animated.View style={styles.touchpadContainer}>
        <GestureDetector gesture={composed}>
          <Animated.View style={styles.touchpad}>
            <KeepAwakeText />
          </Animated.View>
        </GestureDetector>

        {/* Touchpad */}
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
        <TouchableOpacity style={styles.clickBtn} onPress={sendLeftClick}>
          <Text style={styles.clickBtnText}>Left Click</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.clickBtn} onPress={sendRightClick}>
          <Text style={styles.clickBtnText}>Right Click</Text>
        </TouchableOpacity>
      </View>
      {/* Mouse Buttons */}
    </>
  );
}

const styles = StyleSheet.create({
  touchpadContainer: {
    width: '100%',
    minHeight: 360,
    height: '50%',
    marginTop: 16,
    marginBottom: 2,
    justifyContent: 'space-between',
    flexDirection: 'row',
  },
  touchpad: {
    width: '94%',
    height: '100%',
    borderRadius: 8,
    backgroundColor: colors.TOUCHPAD,
    justifyContent: 'center',
    alignItems: 'center',
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
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  button: {
    width: '100%',
    backgroundColor: 'blue',
  },
  clicksWrapper: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  clickBtn: {
    width: '49.6%',
    height: 60,
    borderRadius: 4,
    backgroundColor: colors.TOUCHPAD,
    justifyContent: 'center',
    alignItems: 'center',
  },
  clickBtnText: {
    fontFamily: 'Raleway-Thin',
    color: colors.WHITE,
  },
});
