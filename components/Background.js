import {ImageBackground, StyleSheet, Text, View} from 'react-native';
import React from 'react';

export default function Background({children}) {
  return (
    <ImageBackground
      source={require('../assets/img/bg.png')}
      style={{
        flex: 1,
        backgroundColor: colors.PRIM_BG,
        paddingHorizontal: 16,
      }}
      imageStyle={{
        opacity: 0.05,
      }}>
      {children}
    </ImageBackground>
  );
}

const styles = StyleSheet.create({});
