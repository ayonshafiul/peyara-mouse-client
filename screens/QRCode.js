import React, {useState, useEffect} from 'react';
import {
  Text,
  View,
  StyleSheet,
  Button,
  Alert,
  ActivityIndicator,
} from 'react-native';
import {BarCodeScanner} from 'expo-barcode-scanner';
import {Dimensions} from 'react-native';

import QrCodeButtonIcon from '../assets/svg/qr-code-button.svg';
import QrCodeRectangleIcon from '../assets/svg/qr-code-rectangle.svg';
import {TouchableOpacity} from 'react-native-gesture-handler';
import colors from '../assets/constants/colors';
import {addServer} from '../utils/servers';

export default function QRCode({navigation}) {
  const [hasPermission, setHasPermission] = useState(null);
  const [scanned, setScanned] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const getBarCodeScannerPermissions = async () => {
      const {status} = await BarCodeScanner.requestPermissionsAsync();
      console.log(status);
      setHasPermission(status === 'granted');
    };

    getBarCodeScannerPermissions();
  }, []);

  const handleBarCodeScanned = async ({type, data}) => {
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

  if (hasPermission === null) {
    return <Text>Requesting for camera permission</Text>;
  }
  if (hasPermission === false) {
    return <Text>No access to camera</Text>;
  }

  return (
    <View style={styles.container}>
      <View style={styles.innerContainer}>
        {!scanned && !loading && (
          <>
            <BarCodeScanner
              onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
              style={styles.barcodeContainer}
              barCodeTypes={[BarCodeScanner.Constants.BarCodeType.qr]}
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
        onPress={() => navigation.goBack()}>
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
    width: 300,
    height: 300,
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
