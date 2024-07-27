import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import React from 'react';
import colors from '../assets/constants/colors';

export default function ControlButton({
  onPress = null,
  text,
  containerStyle,
  smallVariation,
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[
        styles.button,
        containerStyle,
        smallVariation && styles.smallVariation,
      ]}>
      <Text style={styles.text}>{text}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: 4,
    paddingVertical: 4,
    paddingHorizontal: 12,
    marginHorizontal: 8,
    marginVertical: 4,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.TOUCHPAD,
  },
  smallVariation: {
    paddingHorizontal: 4,
  },
  text: {
    flex: 1,
    fontFamily: 'Raleway-Regular',
    fontSize: 18,
    color: colors.WHITE,
  },
});
