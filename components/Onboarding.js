import React, { useRef, useCallback, useEffect } from "react";
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
} from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
  withRepeat,
} from "react-native-reanimated";
import * as Linking from "expo-linking";
import * as Clipboard from "expo-clipboard";
import colors from "../assets/constants/colors";
import NextIcon from "../assets/svg/arrow-next.svg";
import FingerIcon from "../assets/svg/finger.svg";
import CursorIcon from "../assets/svg/cursor.svg";
import SingleTapIcon from "../assets/svg/single-tap.svg";
import DoubleTapIcon from "../assets/svg/double-tap.svg";
import TwoFingerScrollIcon from "../assets/svg/two-finger-scroll.svg";
import ThreeFingerWindowDragIcon from "../assets/svg/three-finger-window-drag.svg";
import { Redirect, router, useRouter } from "expo-router";
import { setBooleanValueFor } from "../utils/secure-store";
import { SETTINGS_ONBOARDING_SHOW_FIRST_TIME } from "../assets/constants/constants";

const duration = 2000;
const WIDTH = Dimensions.get("window").width;
const SERVER_LINK = "https://peyara-remote-mouse.vercel.app";
function DownloadServer() {
  const openLink = () => {
    Linking.openURL(SERVER_LINK);
  };
  const copyLink = async () => {
    await Clipboard.setStringAsync(SERVER_LINK);
    Alert.alert("Link Copied");
  };
  return (
    <View style={styles.downloadContainer}>
      <Text style={styles.whiteText}>
        Download the server client on your desktop from
      </Text>

      <TouchableOpacity onPress={openLink}>
        <Text style={styles.linkText}>{SERVER_LINK} </Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={copyLink}>
        <Text style={styles.linkText}>Copy Link</Text>
      </TouchableOpacity>
    </View>
  );
}

function StartServer() {
  return (
    <View style={[styles.downloadContainer, { alignItems: "flex-start" }]}>
      <Text style={styles.whiteText}>1. Install the desktop client</Text>

      <Text style={styles.whiteText}>2. Start the desktop server </Text>

      <Text style={styles.whiteText}>
        3. Click on the plus button on the mobile app and scan the qr code
      </Text>

      <Text style={styles.whiteText}>
        4. From the server list select the server and connect
      </Text>
    </View>
  );
}

function MoveCursor() {
  const tX = useSharedValue(50);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: tX.value }],
  }));

  React.useEffect(() => {
    tX.value = withRepeat(
      withTiming(-tX.value, {
        duration,
      }),
      -1,
      true
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
    transform: [{ translateY: t.value }],
  }));

  React.useEffect(() => {
    t.value = withRepeat(
      withTiming(-t.value, {
        duration,
      }),
      -1,
      true
    );
  }, []);
  return (
    <>
      <Window>
        <Animated.View
          style={[styles.scrollbar, moveVertically]}
        ></Animated.View>
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
    transform: [{ translateX: t.value }],
  }));

  React.useEffect(() => {
    t.value = withRepeat(
      withTiming(-t.value, {
        duration,
      }),
      -1,
      true
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

const steps = [
  {
    label: "Download Server",
    component: <DownloadServer />,
  },
  {
    label: "Install and Start Server",
    component: <StartServer />,
  },
  {
    label: "Move the desktop cursor",
    component: <MoveCursor />,
  },

  {
    label: "Tap once for click",
    component: <TapOnce />,
  },
  {
    label: "Tap twice for double click",
    component: <TapTwice />,
  },

  {
    label: "Two Finger Drag to scroll",
    component: <TwoFingerScroll />,
  },

  {
    label: "Three Finger Drag to click and drag",
    component: <ThreeFingerWindowDrag />,
  },
];

function Window({ children, style }) {
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

export default function OnBoarding() {
  const flatListRef = useRef();
  const router = useRouter();
  const goToNextStep = async (index) => {
    if (index < steps.length) {
      flatListRef.current.scrollToIndex({
        index: index,
        animated: true,
      });
    } else {
      // don't show this screen next time
      await setBooleanValueFor(SETTINGS_ONBOARDING_SHOW_FIRST_TIME, false);
      router.replace("home");
    }
  };

  const StepsCard = useCallback(({ item, index }) => {
    return (
      <View style={styles.stepContainer}>
        <Text style={styles.label}>{item.label}</Text>
        {item.component}
        <TouchableOpacity
          onPress={() => goToNextStep(index + 1)}
          style={styles.nextButton}
        >
          <NextIcon />
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
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 48,
    // backgroundColor: "blue",
  },
  touchpad: {
    width: 200,
    height: 200,
    margin: 16,
    borderRadius: 8,
    backgroundColor: colors.TOUCHPAD,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  placeTop: {
    position: "absolute",
    top: 10,
    left: 90,
    justifyContent: "center",
    alignItems: "center",
  },
  scrollbar: {
    width: 5,
    height: 40,
    borderRadius: 5,
    backgroundColor: colors.WHITE,
    position: "absolute",
    right: 4,
    justifyContent: "center",
    alignContent: "center",
  },
  dotContainer: {
    position: "absolute",
    top: 10,
    left: 10,
    flexDirection: "row",
    justifyContent: "flex-start",
    gap: 4,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  dotRed: {
    backgroundColor: "red",
  },
  dotGreen: {
    backgroundColor: "green",
  },
  dotYellow: {
    backgroundColor: "yellow",
  },
  label: {
    fontFamily: "Inter_400Regular",
    color: colors.WHITE,
    fontWeight: "bold",
    fontSize: 24,
    textAlign: "center",
  },
  nextButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    overflow: "hidden",
    backgroundColor: colors.PRIM_ACCENT,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  nextButtonText: {
    fontFamily: "Inter_400Regular",
    color: colors.PRIM_BG,
    fontWeight: "bold",
    fontSize: 18,
    textTransform: "uppercase",
  },
  downloadContainer: {
    flex: 1,
    justifyContent: "space-around",
    alignItems: "flex-start",
    gap: 10,
    marginVertical: 16,
    padding: 24,
  },
  whiteText: {
    fontFamily: "Inter_400Regular",
    color: colors.WHITE,
    fontWeight: "bold",
    fontSize: 16,
  },
  linkText: {
    fontFamily: "Inter_400Regular",
    color: colors.WHITE,
    fontWeight: "bold",
    fontSize: 18,
    textDecorationLine: "underline",
  },
});
