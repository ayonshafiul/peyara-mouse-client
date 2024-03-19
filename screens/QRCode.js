import React, {useState, useEffect} from 'react';
import {
  Text,
  View,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Linking,
} from 'react-native';

import QrCodeButtonIcon from '../assets/svg/qr-code-button.svg';
import QrCodeRectangleIcon from '../assets/svg/qr-code-rectangle.svg';
import {TouchableOpacity} from 'react-native-gesture-handler';
import colors from '../assets/constants/colors';
import {addServer} from '../utils/servers';
import {
  Camera,
  useCameraDevice,
  useCameraPermission,
  useCodeScanner,
} from 'react-native-vision-camera';

export default function QRCode({navigation}) {
  const {hasPermission, requestPermission} = useCameraPermission();
  const [scanned, setScanned] = useState(false);
  const [loading, setLoading] = useState(false);

  const device = useCameraDevice('back');
  const codeScanner = useCodeScanner({
    codeTypes: ['qr'],
    onCodeScanned: codes => {
      if (codes.length > 0) {
        try {
          let codeValue = codes[0].value;
          if (codeValue) {
            setScanned(true);
            handleBarCodeScanned(codeValue);
          }
        } catch (e) {
          console.log(e);
        }
      }
    },
  });

  useEffect(() => {
    (async function initializePermission() {
      if (!hasPermission) {
        const grantedPermission = await requestPermission();
        if (!grantedPermission) {
          Alert.alert(
            'Camera Permission Requried',
            'Camera permission is required to grant access to the camera for qr code scanning.',
            [{text: 'Open Settings', onPress: () => Linking.openSettings()}],
            {cancelable: false},
          );
        }
      }
    })();
  }, []);

  const handleBarCodeScanned = async data => {
    setLoading(true);
    let qrCodeAdded = await addServer(data);
    setLoading(false);
    if (!qrCodeAdded) {
      Alert.alert(
        'Invalid QR code or different wifi network.',
        'Make sure your desktop and mobile are connected to the same wifi network. Only scan the QR code shown on Peyara desktop client. ',
      );
      setScanned(true);
    } else {
      navigation.goBack();
    }
  };

  if (device == null)
    return (
      <View>
        <Text>No Camera Devices Found</Text>
      </View>
    );

  return (
    <View style={styles.container}>
      <View style={styles.innerContainer}>
        {hasPermission && !scanned && !loading && (
          <>
            <Camera
              style={styles.barcodeContainer}
              device={device}
              isActive={true}
              codeScanner={codeScanner}
            />
            <QrCodeRectangleIcon style={styles.qrCode} />
          </>
        )}
        {loading && (
          <ActivityIndicator size={'large'} color={colors.PRIM_ACCENT} />
        )}
      </View>
      {scanned && (
        <TouchableOpacity
          style={styles.scanAgainButton}
          onPress={() => setScanned(false)}>
          <QrCodeButtonIcon />
          <Text style={styles.scanAgainButtonText}>Scan Again</Text>
        </TouchableOpacity>
      )}
      <TouchableOpacity
        style={styles.scanAgainButton}
        onPress={() => {
          navigation.goBack();
        }}>
        <Text style={styles.scanAgainButtonText}>Go Back</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.PRIM_BG,
    justifyContent: 'center',
    alignItems: 'center',
  },
  innerContainer: {
    position: 'relative',
    width: 400,
    height: 400,

    justifyContent: 'center',
    alignItems: 'center',
  },
  qrCode: {
    position: 'absolute',
    top: 15,
    left: 25,
    zIndex: -1,
  },
  barcodeContainer: {
    width: 280,
    height: 290,
  },

  scanAgainButton: {
    width: 200,
    height: 60,
    borderRadius: 8,
    backgroundColor: colors.PRIM_ACCENT,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
    marginVertical: 8,
  },

  scanAgainButtonText: {
    color: colors.PRIM_BG,
    fontFamily: 'Inter_400Regular',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
