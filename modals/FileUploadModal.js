import {Alert, Image, StyleSheet, View} from 'react-native';
import React, {forwardRef, useMemo, useRef, useState} from 'react';
import {FILE_UPLOAD_STATUS} from '../assets/constants/constants';
import colors from '../assets/constants/colors';
import {BottomSheetModal, BottomSheetScrollView} from '@gorhom/bottom-sheet';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

import DocumentPicker from 'react-native-document-picker';
import * as Progress from 'react-native-progress';
import axios from 'axios';
import AppButton from '../components/AppButton';

const DEFAULT_BTN_TEXT = 'Select a file to send';

function FileUploadModal({url}, ref) {
  const snapPoints = useMemo(() => ['80%'], []);
  const scrollViewRef = useRef(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState('');
  const [file, setFile] = useState(null);
  const [btnText, setBtnText] = useState(DEFAULT_BTN_TEXT);

  const pickFile = async () => {
    try {
      let f = await DocumentPicker.pick({
        type: [DocumentPicker.types.allFiles],
      });
      if (f.length > 0) {
        setFile(f);
        setBtnText(f[0].name);
      }
    } catch (err) {
      if (DocumentPicker.isCancel(err)) {
        setUploadStatus(FILE_UPLOAD_STATUS.cancelled);
        setBtnText(DEFAULT_BTN_TEXT);
        setFile(null);
      } else {
        setUploadStatus(FILE_UPLOAD_STATUS.failed);
        console.error(err);
      }
    }
  };

  const handleFileUpload = async file => {
    if (!file) {
      Alert.alert('Please select a file first.');
      return;
    }
    setUploadStatus(FILE_UPLOAD_STATUS.uploading);
    try {
      // Create a FormData object to send the file
      const formData = new FormData();
      formData.append('file', {
        uri: file[0].uri,
        type: file[0].type,
        name: file[0].name,
      });

      // Send the file using axios
      axios
        .post(url + 'upload', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          onUploadProgress: progressEvent => {
            const progress = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total,
            );
            setUploadProgress(progress);
          },
        })
        .then(response => {
          setUploadStatus(FILE_UPLOAD_STATUS.success);
          Alert.alert(
            'File Sent Successfully',
            'Check your downloads folder in your pc.',
          );
          setFile(null);
          setBtnText(DEFAULT_BTN_TEXT);
          setUploadProgress(0);
        })
        .catch(error => {
          setUploadStatus(FILE_UPLOAD_STATUS.failed);
          console.error(error);
        });
    } catch (err) {
      setUploadStatus(FILE_UPLOAD_STATUS.failed);
      console.error(err);
    }
  };
  return (
    <View style={styles.container}>
      <BottomSheetModal
        ref={ref}
        index={0}
        snapPoints={snapPoints}
        handleStyle={{
          backgroundColor: colors.PRIM_BG,
        }}
        handleIndicatorStyle={{
          backgroundColor: colors.WHITE,
        }}
        style={{
          backgroundColor: colors.PRIM_BG,
        }}
        enableOverDrag={false}
        detached>
        <BottomSheetScrollView
          style={styles.scrollContainer}
          keyboardShouldPersistTaps="handled"
          ref={scrollViewRef}>
          <Image
            source={require('../assets/img/send.png')}
            style={styles.img}
            resizeMode="cover"
          />
          <View style={styles.selectContainer}>
            <MaterialIcons
              name="file-present"
              size={24}
              color={colors.PRIM_ACCENT}
            />
            <AppButton text={btnText} onPress={pickFile} style={styles.btn} />
          </View>

          <View style={styles.selectContainer}>
            <MaterialIcons
              name="file-upload"
              size={24}
              color={colors.PRIM_ACCENT}
            />
            <AppButton
              text={'Send to PC'}
              onPress={() => handleFileUpload(file)}
              style={styles.btn}
            />
          </View>

          {(uploadStatus === FILE_UPLOAD_STATUS.uploading ||
            uploadStatus === FILE_UPLOAD_STATUS.failed) && (
            <View style={styles.progressContainer}>
              <Progress.Circle
                progress={uploadProgress / 100}
                size={50}
                showsText
                color={
                  uploadStatus === FILE_UPLOAD_STATUS.failed
                    ? colors.RED
                    : colors.PRIM_ACCENT
                }
                thickness={6}
              />
            </View>
          )}
        </BottomSheetScrollView>
      </BottomSheetModal>
    </View>
  );
}

export default forwardRef(FileUploadModal);
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    backgroundColor: colors.PRIM_BG,
  },
  contentContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
  },
  selectContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 16,
    marginTop: 8,
  },
  img: {
    width: '100%',
    height: 200,
    alignSelf: 'center',
  },
  btn: {
    flex: 1,
  },
  btnMargin: {
    width: 180,
    alignSelf: 'center',
  },
  progressContainer: {
    marginVertical: 24,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    flex: 1,
  },
});
