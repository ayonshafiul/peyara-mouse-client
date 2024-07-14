import {Platform, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import React, {useEffect, useState} from 'react';
import colors from '../assets/constants/colors';
import AppButton from './AppButton';
import Clipboard from '@react-native-clipboard/clipboard';
import {TextInput} from 'react-native-gesture-handler';
import {BottomSheetTextInput} from '@gorhom/bottom-sheet';

export default function ClipText({sendText, receivedText, onFocus}) {
  const [text, setText] = useState('');
  const [copyBtnText, setCopyBtnText] = useState('Copy to Clipoboard');
  useEffect(() => {
    setText(receivedText);
  }, [receivedText]);

  const copyToClipboard = () => {
    if (text) {
      Clipboard.setString(text);
      setCopyBtnText('Copied!');
      setTimeout(() => {
        setCopyBtnText('Copy to Clipboard');
      }, 1200);
    }
  };
  return (
    <>
      <View style={styles.labelWrapper}>
        <Text style={styles.text}>Send / Receive from PC</Text>
        <TouchableOpacity onPress={copyToClipboard}>
          <Text style={[styles.text, {color: colors.PRIM_ACCENT}]}>
            {copyBtnText}
          </Text>
        </TouchableOpacity>
      </View>
      {Platform.OS === 'android' ? (
        <TextInput
          value={text}
          onChangeText={setText}
          placeholderTextColor={colors.WHITE}
          style={styles.input}
          onFocus={onFocus}
          multiline
          numberOfLines={3}
          textAlignVertical="top"
          placeholder="Paste or Type here to send to PC"
          keyboardAppearance="light"
        />
      ) : (
        <BottomSheetTextInput
          value={text}
          onChangeText={setText}
          placeholderTextColor={colors.WHITE}
          style={styles.input}
          onFocus={onFocus}
          multiline
          numberOfLines={3}
          textAlignVertical="top"
          placeholder="Paste or Type here to send to PC"
          keyboardAppearance="light"
        />
      )}
      <AppButton
        text={'Send to pc'}
        onPress={() => {
          if (typeof sendText === 'function') {
            sendText(text);
            setText('');
          }
        }}
      />
    </>
  );
}

const styles = StyleSheet.create({
  input: {
    borderWidth: 1,
    borderColor: colors.PRIM_ACCENT,
    color: colors.WHITE,
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 10,
    padding: 16,
    fontFamily: 'Raleway-Regular',
    fontSize: 12,
  },
  text: {
    marginHorizontal: 16,
    fontFamily: 'Raleway-Regular',
    color: colors.WHITE,
  },
  labelWrapper: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});
