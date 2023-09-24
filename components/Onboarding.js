import React, { useRef, useCallback } from "react";
import {
  StyleSheet,
  View,
  Text,
  Dimensions,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
} from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
  withRepeat,
} from "react-native-reanimated";
import colors from "../assets/constants/colors";
import FingerIcon from "../assets/svg/finger.svg";
import CursorIcon from "../assets/svg/cursor.svg";
import SingleTapIcon from "../assets/svg/single-tap.svg";
import DoubleTapIcon from "../assets/svg/double-tap.svg";
import TwoFingerScrollIcon from "../assets/svg/two-finger-scroll.svg";
import ThreeFingerWindowDragIcon from "../assets/svg/three-finger-window-drag.svg";
import { Redirect, router, useRouter } from "expo-router";

const duration = 2000;
const WIDTH = Dimensions.get("window").width;

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
    label: "Move around",
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
  const goToNextStep = (index) => {
    if (index < steps.length) {
      flatListRef.current.scrollToIndex({
        index: index,
        animated: true,
      });
    } else {
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
          <Text style={styles.nextButtonText}>Next</Text>
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
    width: 200,
    padding: 16,
    borderRadius: 8,
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
});
