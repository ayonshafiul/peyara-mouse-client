import {StyleSheet, Text, View} from 'react-native';
import React, {useState} from 'react';
import {TextInput} from 'react-native-gesture-handler';
import colors from '../assets/constants/colors';
import AppButton from './AppButton';

export default function ClipText({sendText}) {
  const [text, setText] = useState('');
  return (
    <>
      <TextInput
        value={text}
        onChangeText={setText}
        style={styles.input}
        multiline
        numberOfLines={3}
        textAlignVertical="top"
        placeholder="Paste or Type here to send to PC"
      />
      <AppButton
        text={'Send to pc'}
        onPress={() => {
          if (typeof sendText === 'function') {
            sendText();
            setText('');
          }
        }}
      />
    </>
  );
}

const styles = StyleSheet.create({
  input: {
    borderBottomWidth: 1,
    borderLeftWidth: 1,

    borderColor: colors.PRIM_ACCENT,
    color: colors.WHITE,
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 10,
    padding: 16,
    fontFamily: 'Raleway-Regular',
    fontSize: 12,
  },
});
