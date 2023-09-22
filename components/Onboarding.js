import React, { useCallback, useRef } from "react";
import {
  Dimensions,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  FlatList,
  Button,
  TouchableOpacity,
} from "react-native";
import global from "../assets/styles/global";
import Animated from "react-native-reanimated";
import colors from "../assets/constants/colors";

const WIDTH = Dimensions.get("window").width;
const HEIGHT = Dimensions.get("window").height;

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
  return (
    <View>
      <Text>Move Cursor</Text>
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

export default function Onboarding() {
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

  const StepsCard = useCallback(
    ({ item, index }) => {
      return (
        <View style={styles.stepContainer}>
          <Text>{item.label}</Text>
          {/* {item.component} */}
          <TouchableOpacity onPress={() => goToNextStep(index + 1)}>
            <Text>Next</Text>
          </TouchableOpacity>
        </View>
      );
    },
    [goToNextStep]
  );

  return (
    <SafeAreaView style={styles.container}>
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
  container: {
    flex: 1,
    backgroundColor: colors.PRIM_BG,
  },
  stepContainer: {
    width: WIDTH,
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "blue",
  },
});
