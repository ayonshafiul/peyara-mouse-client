import {ImageBackground, StyleSheet} from 'react-native';
import React from 'react';
import colors from '../assets/constants/colors';

export default function Background({children}) {
  return (
    <ImageBackground
      source={require('../assets/img/bg.png')}
      style={styles.container}
      imageStyle={styles.image}>
      {children}
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.PRIM_BG,
  },
  image: {
    opacity: 0.05,
  },
});
