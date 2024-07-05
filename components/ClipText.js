import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  TextInput,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import colors from '../assets/constants/colors';
import AppButton from './AppButton';
import Clipboard from '@react-native-clipboard/clipboard';

export default function ClipText({sendText, receivedText}) {
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
  text: {
    marginHorizontal: 16,
    fontFamily: 'Raleway-Regular',
  },
  labelWrapper: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});
