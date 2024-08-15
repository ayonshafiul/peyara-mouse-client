import {StyleSheet, Text} from 'react-native';
import React from 'react';
import {getKeepAwakeSettings} from '../utils/settings';
import colors from '../assets/constants/colors';

export default function KeepAwakeText() {
  const keepAwake = getKeepAwakeSettings();
  return (
    <>
      {keepAwake && (
        <Text style={styles.keepAwakeTxt}>
          Keep awake settings is active. The screen will not turn off while
          connected.
        </Text>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  keepAwakeTxt: {
    fontFamily: 'Raleway-Regular',
    fontSize: 12,
    color: colors.WHITE,
    margin: 40,
    textAlign: 'center',
  },
});
