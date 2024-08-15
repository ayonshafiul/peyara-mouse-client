import {StyleSheet, Text, TouchableOpacity} from 'react-native';
import React from 'react';
import colors from '../assets/constants/colors';

export default function AppButton({onPress, text, style, textStyle}) {
  return (
    <TouchableOpacity onPress={onPress} style={[styles.button, style]}>
      <Text style={[styles.text, textStyle]}>{text}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: colors.PRIM_ACCENT,
    borderRadius: 10,
    padding: 10,
    margin: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomWidth: 2,
    borderLeftWidth: 2,
    borderColor: colors.PRIM_BG,
  },
  text: {
    fontFamily: 'Raleway-Bold',
    fontSize: 14,
    color: colors.PRIM_BG,
  },
});
