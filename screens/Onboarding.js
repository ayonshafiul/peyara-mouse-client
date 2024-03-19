import React, {useRef, useCallback, useEffect} from 'react';
import {
  StyleSheet,
  View,
  Text,
  Dimensions,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  Image,
  Alert,
  Linking,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
  withRepeat,
} from 'react-native-reanimated';

import colors from '../assets/constants/colors';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import NextIcon from '../assets/svg/arrow-next.svg';
import ServerIcon from '../assets/img/server.png';
import StartServerIcon from '../assets/img/server-start.png';
import ServerConnectIcon from '../assets/img/server-connect.jpg';
import QRCodeIcon from '../assets/img/qrcode.jpg';
import TouchpadIcon from '../assets/img/touchpad-short.jpg';
import FingerIcon from '../assets/svg/finger.svg';
import CursorIcon from '../assets/svg/cursor.svg';
import SingleTapIcon from '../assets/svg/single-tap.svg';
import DoubleTapIcon from '../assets/svg/double-tap.svg';
import TwoFingerScrollIcon from '../assets/svg/two-finger-scroll.svg';
import ThreeFingerWindowDragIcon from '../assets/svg/three-finger-window-drag.svg';

import {setBooleanValueFor} from '../utils/storage';
import {SETTINGS_ONBOARDING_SHOW_FIRST_TIME} from '../assets/constants/constants';
import {useNavigation} from '@react-navigation/native';

const duration = 2000;
const WIDTH = Dimensions.get('window').width;
const SERVER_LINK = 'https://peyara-remote-mouse.vercel.app';

function DownloadServer() {
  const openLink = () => {
    Linking.openURL(SERVER_LINK);
  };
  const copyLink = async () => {
    // TODO add clipboard
    Alert.alert('Link Copied');
  };
  return (
    <TouchableOpacity style={styles.downloadContainer} onPress={openLink}>
      <Image source={ServerIcon} style={styles.image} />

      <Text style={styles.whiteText}>Download for Windows, MacOS or Linux</Text>

      <Text style={styles.whiteText}>Click to visit website</Text>

      <TouchableOpacity onPress={openLink}>
        <Text style={styles.linkText}>{SERVER_LINK} </Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={copyLink}>
        <Text style={styles.linkText}>Copy Link</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );
}

function StartServer() {
  return (
    <View style={[styles.downloadContainer]}>
      <Image source={StartServerIcon} style={{width: 280, height: 300}} />
    </View>
  );
}

function ScanQRCode() {
  return (
    <View style={[styles.downloadContainer]}>
      <Image source={QRCodeIcon} style={{width: 280, height: 300}} />
    </View>
  );
}

function ConnectServer() {
  return (
    <View style={[styles.downloadContainer]}>
      <Image source={ServerConnectIcon} style={{width: 280, height: 320}} />
    </View>
  );
}

function TouchpadControls() {
  return (
    <View style={[styles.downloadContainer]}>
      <Image source={TouchpadIcon} style={{width: 280, height: 440}} />
    </View>
  );
}

export function MoveCursor() {
  const tX = useSharedValue(50);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{translateX: tX.value}],
  }));

  React.useEffect(() => {
    tX.value = withRepeat(
      withTiming(-tX.value, {
        duration,
      }),
      -1,
      true,
    );
  }, []);
  return (
    <>
      <Window>
        <Animated.View style={animStyle}>
          <CursorIcon />
        </Animated.View>
      </Window>
      <View style={styles.touchpad}>
        <Animated.View style={animStyle}>
          <FingerIcon />
        </Animated.View>
      </View>
    </>
  );
}

function TapOnce() {
  return (
    <>
      <Window>
        <CursorIcon />
      </Window>
      <View style={styles.touchpad}>
        <SingleTapIcon />
      </View>
    </>
  );
}

function TapTwice() {
  return (
    <>
      <Window>
        <CursorIcon />
      </Window>
      <View style={styles.touchpad}>
        <DoubleTapIcon />
      </View>
    </>
  );
}

function TwoFingerScroll() {
  const t = useSharedValue(50);

  const moveVertically = useAnimatedStyle(() => ({
    transform: [{translateY: t.value}],
  }));

  React.useEffect(() => {
    t.value = withRepeat(
      withTiming(-t.value, {
        duration,
      }),
      -1,
      true,
    );
  }, []);
  return (
    <>
      <Window>
        <Animated.View
          style={[styles.scrollbar, moveVertically]}></Animated.View>
        <CursorIcon />
      </Window>
      <View style={styles.touchpad}>
        <Animated.View style={moveVertically}>
          <TwoFingerScrollIcon />
        </Animated.View>
      </View>
    </>
  );
}

function ThreeFingerWindowDrag() {
  const t = useSharedValue(50);

  const moveHorizontally = useAnimatedStyle(() => ({
    transform: [{translateX: t.value}],
  }));

  React.useEffect(() => {
    t.value = withRepeat(
      withTiming(-t.value, {
        duration,
      }),
      -1,
      true,
    );
  }, []);
  return (
    <>
      <Window style={moveHorizontally}>
        <View style={styles.placeTop}>
          <CursorIcon />
        </View>
      </Window>
      <View style={styles.touchpad}>
        <Animated.View style={moveHorizontally}>
          <ThreeFingerWindowDragIcon />
        </Animated.View>
      </View>
    </>
  );
}

function ShowKeyboard() {
  return <MaterialIcons name="keyboard-hide" size={48} color={colors.WHITE} />;
}

const steps = [
  {
    label: 'Step 1: Download Server Client on your desktop',
    component: <DownloadServer />,
  },
  {
    label: 'Step 2: Install Server Client and start Server on your desktop',
    component: <StartServer />,
  },
  {
    label: 'Step 3: Scan QRCode from  the mobile app',
    component: <ScanQRCode />,
  },
  {
    label: 'Step 4: Select a Server and click to connect',
    component: <ConnectServer />,
  },
  {
    label: 'Now lets learn about touchpad controls!',
    component: <TouchpadControls />,
  },

  {
    label: 'Tutorial: Move the desktop cursor',
    component: <MoveCursor />,
  },

  {
    label: 'Tutorial: Tap once for click',
    component: <TapOnce />,
  },
  {
    label: 'Tutorial: Tap twice for double click',
    component: <TapTwice />,
  },

  {
    label: 'Tutorial: Two Finger Drag to scroll',
    component: <TwoFingerScroll />,
  },

  {
    label: 'Tutorial: Three Finger Drag to move/resize windows',
    component: <ThreeFingerWindowDrag />,
  },
  {
    label: 'Press to show keyboard',
    component: <ShowKeyboard />,
  },
];

function Window({children, style}) {
  return (
    <Animated.View style={[styles.touchpad, style]}>
      <View style={styles.dotContainer}>
        <View style={[styles.dot, styles.dotRed]}></View>
        <View style={[styles.dot, styles.dotYellow]}></View>
        <View style={[styles.dot, styles.dotGreen]}></View>
      </View>
      {children}
    </Animated.View>
  );
}

export default function Onboarding({navigation}) {
  const flatListRef = useRef();

  const goToNextStep = async index => {
    if (index < steps.length) {
      flatListRef.current.scrollToIndex({
        index: index,
        animated: true,
      });
    } else {
      // don't show this screen next time
      setBooleanValueFor(SETTINGS_ONBOARDING_SHOW_FIRST_TIME, false);
      navigation.navigate('Tabs');
    }
  };

  const StepsCard = useCallback(({item, index}) => {
    return (
      <View style={styles.stepContainer}>
        <Text style={styles.label}>{item.label}</Text>
        {item.component}
        <TouchableOpacity
          onPress={() => goToNextStep(index + 1)}
          style={[styles.nextButton]}>
          <NextIcon />

          <Text style={styles.nextButtonText}>
            {index == 0
              ? 'Done'
              : index == steps.length - 1
              ? "Let's start"
              : 'Next'}
          </Text>
        </TouchableOpacity>
      </View>
    );
  }, []);

  return (
    <SafeAreaView style={styles.containerSafe}>
      <FlatList
        ref={flatListRef}
        data={steps}
        renderItem={StepsCard}
        keyExtractor={(item, index) => index}
        horizontal
        showsHorizontalScrollIndicator={false}
        pagingEnabled
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  containerSafe: {
    flex: 1,
    backgroundColor: colors.PRIM_BG,
  },

  stepContainer: {
    width: WIDTH,
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 48,
    // backgroundColor: "blue",
  },
  image: {
    width: 152,
    height: 152,
  },
  touchpad: {
    width: 200,
    height: 200,
    margin: 16,
    borderRadius: 8,
    backgroundColor: colors.TOUCHPAD,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  placeTop: {
    position: 'absolute',
    top: 10,
    left: 90,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollbar: {
    width: 5,
    height: 40,
    borderRadius: 5,
    backgroundColor: colors.WHITE,
    position: 'absolute',
    right: 4,
    justifyContent: 'center',
    alignContent: 'center',
  },
  dotContainer: {
    position: 'absolute',
    top: 10,
    left: 10,
    flexDirection: 'row',
    justifyContent: 'flex-start',
    gap: 4,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  dotRed: {
    backgroundColor: 'red',
  },
  dotGreen: {
    backgroundColor: 'green',
  },
  dotYellow: {
    backgroundColor: 'yellow',
  },
  label: {
    fontFamily: 'Inter_400Regular',
    color: colors.WHITE,
    fontWeight: 'bold',
    fontSize: 24,
    textAlign: 'center',
  },
  nextButton: {
    width: 200,
    height: 50,
    borderRadius: 25,
    overflow: 'hidden',
    backgroundColor: colors.PRIM_ACCENT,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  nextButtonText: {
    fontFamily: 'Inter_400Regular',
    color: colors.PRIM_BG,
    fontWeight: 'bold',
    fontSize: 18,
    textTransform: 'uppercase',
  },
  downloadContainer: {
    flex: 1,
    justifyContent: 'space-around',
    alignItems: 'center',
    gap: 10,
    marginVertical: 16,
  },
  whiteText: {
    fontFamily: 'Inter_400Regular',
    color: colors.WHITE,
    fontSize: 16,
  },
  linkText: {
    fontFamily: 'Inter_400Regular',
    color: colors.PRIM_FRONT,
    textDecorationLine: 'underline',
  },
});
