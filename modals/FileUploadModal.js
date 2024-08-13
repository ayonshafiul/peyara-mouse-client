import {
  Alert,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import React, {forwardRef, useCallback, useMemo, useRef, useState} from 'react';
import {FILE_UPLOAD_STATUS} from '../assets/constants/constants';
import colors from '../assets/constants/colors';
import {BottomSheetModal, BottomSheetScrollView} from '@gorhom/bottom-sheet';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

import DocumentPicker from 'react-native-document-picker';
import * as Progress from 'react-native-progress';
import axios from 'axios';
import AppButton from '../components/AppButton';
import {launchImageLibrary} from 'react-native-image-picker';

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function FileUploadModal({url}, ref) {
  const snapPoints = useMemo(() => ['80%'], []);
  const scrollViewRef = useRef(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState('');
  const [files, setFiles] = useState([]);
  const [currentFile, setCurrentFile] = useState('');

  const pickFile = async () => {
    try {
      let f = await DocumentPicker.pick({
        type: [DocumentPicker.types.allFiles],
        allowMultiSelection: true,
      });
      if (f.length > 0) {
        setFiles(f);
      }
    } catch (err) {
      if (DocumentPicker.isCancel(err)) {
        setUploadStatus(FILE_UPLOAD_STATUS.cancelled);

        setFiles([]);
      } else {
        setUploadStatus(FILE_UPLOAD_STATUS.failed);
        console.error(err);
      }
    }
  };

  const pickMedia = async () => {
    try {
      const {assets} = await launchImageLibrary({
        selectionLimit: 0,
        mediaType: 'mixed',
      });
      if (assets && assets.length > 0) {
        setFiles(assets.map(a => ({...a, name: a.fileName})));
      }
    } catch (err) {
      setUploadStatus(FILE_UPLOAD_STATUS.failed);
      console.error(err);
    }
  };

  const handleFileUpload = useCallback(async () => {
    if (!files) {
      Alert.alert('Please select files first.');
      return;
    }
    for (const f of files) {
      setUploadStatus(FILE_UPLOAD_STATUS.uploading);
      try {
        const formData = new FormData();
        formData.append('file', {
          uri: f.uri,
          type: f.type,
          name: f.name,
        });
        setCurrentFile(f.name);

        // Send the file using axios
        const res = await axios.post(url + 'upload', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          onUploadProgress: progressEvent => {
            const progress = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total,
            );
            setUploadProgress(progress);
          },
        });
        setUploadStatus(FILE_UPLOAD_STATUS.success);
      } catch (err) {
        setUploadStatus(FILE_UPLOAD_STATUS.failed);
        console.error(err);
      }
      await sleep(500);
    }
    setFiles([]);
    setCurrentFile('');
    Alert.alert(
      'File(s) sent successfully.',
      'Check the Downloads folder on your PC.',
    );
  }, [files, url]);
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
          {files.length === 0 && (
            <>
              <View style={styles.selectContainer}>
                <MaterialIcons
                  name="file-present"
                  size={24}
                  color={colors.PRIM_ACCENT}
                />
                <AppButton
                  text={'Select Files'}
                  onPress={pickFile}
                  style={styles.btn}
                />
              </View>

              <View style={styles.selectContainer}>
                <MaterialIcons
                  name="perm-media"
                  size={24}
                  color={colors.PRIM_ACCENT}
                />
                <AppButton
                  text={'Select Media'}
                  onPress={pickMedia}
                  style={styles.btn}
                />
              </View>
            </>
          )}
          {files.length > 0 && (
            <>
              <Text style={styles.currentFileTxt}>
                {files.length} file(s) selected for sending.
              </Text>
              <TouchableOpacity onPress={() => setFiles([])}>
                <Text style={[styles.currentFileTxt, styles.cancelTxt]}>
                  Cancel
                </Text>
              </TouchableOpacity>
            </>
          )}

          <View style={styles.selectContainer}>
            <MaterialIcons
              name="file-upload"
              size={24}
              color={colors.PRIM_ACCENT}
            />
            <AppButton
              text={'Send to PC'}
              onPress={handleFileUpload}
              style={styles.btn}
            />
          </View>

          <Text style={styles.currentFileTxt}>{currentFile}</Text>

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
  currentFileTxt: {
    color: colors.WHITE,
    fontFamily: 'Raleway-Regular',
    textAlign: 'center',
    marginVertical: 4,
  },
  cancelTxt: {
    color: colors.PRIM_ACCENT,
  },
});
