import React, { useRef } from "react";
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
import FingerIcon from "../assets/svg/finger.svg";

const duration = 2000;
const WIDTH = Dimensions.get("window").width;

const steps = [
  {
    label: "Move around",
    component: <MoveCursor />,
  },

  {
    label: "Tap once for click!",
    component: <TapOnce />,
  },
  {
    label: "Move around",
    component: <MoveCursor />,
  },

  {
    label: "Tap once for click!",
    component: <TapOnce />,
  },
];

function MoveCursor() {
  const tX = useSharedValue(100);

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
    // <View style={animStyles}>
    <View style={styles.touchpad}>
      <Animated.View style={animStyle}>
        <FingerIcon />
      </Animated.View>
    </View>
  );
}

function TapOnce() {
  return (
    <View>
      <Text>Tap Once</Text>
    </View>
  );
}

export default function MyComponent() {
  const flatListRef = useRef();
  const goToNextStep = (index) => {
    console.log(index);
    if (index < steps.length) {
      flatListRef.current.scrollToIndex({
        index: index,
        animated: true,
      });
    }
  };

  const StepsCard = ({ item, index }) => {
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
  };

  return (
    <SafeAreaView style={styles.containerSafe}>
      <FlatList
        ref={flatListRef}
        data={steps}
        renderItem={(props) => <StepsCard {...props} />}
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
    width: "100%",
    height: 400,
    margin: 16,
    borderRadius: 8,
    backgroundColor: "#272829",
    justifyContent: "center",
    alignItems: "center",
  },
  label: {
    fontFamily: "Inter_400Regular",
    color: colors.WHITE,
    fontWeight: "bold",
    fontSize: 24,
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
