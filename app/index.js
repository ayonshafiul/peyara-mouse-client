import { Link } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useRef } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import {
  PanGestureHandler,
  TapGestureHandler,
} from "react-native-gesture-handler";
import Animated, {
  useAnimatedGestureHandler,
  runOnJS,
} from "react-native-reanimated";
import { io } from "socket.io-client";
const socket = io.connect("http://192.168.0.101:1313");
export default function App() {
  const doubleTapRef = useRef();
  const sendMessage = (data) => {
    socket.emit("coordinates", data);
  };
  const touchPadGestureHandler = useAnimatedGestureHandler({
    onStart: (event) => {
      console.log(event.translationX, event.velocityX);
    },
    onActive: (event) => {
      let coordinates = {
        x: event.translationX,
        y: event.translationY,
        vx: event.velocityX,
        vy: event.velocityY,
      };

      runOnJS(sendMessage)(coordinates);
    },
    onEnd: (event) => {},
  });
  const handleSingleMouseTap = (event) => {
    console.log(event);
  };
  return (
    <View style={styles.container}>
      <PanGestureHandler onGestureEvent={touchPadGestureHandler}>
        <Animated.View style={styles.touchpad}></Animated.View>
      </PanGestureHandler>

      {/* <View style={styles.buttonContainer}>
        <TapGestureHandler
          onHandlerStateChange={handleSingleMouseTap}
          waitFor={doubleTapRef}
        >
          <TapGestureHandler ref={doubleTapRef} numberOfTaps={2}>
            <View style={styles.button}></View>
          </TapGestureHandler>
        </TapGestureHandler>
      </View> */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  touchpad: {
    width: "100%",
    height: 200,
    margin: 16,
    borderRadius: 8,
    backgroundColor: "green",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
  },
  button: {
    width: "100%",
    backgroundColor: "blue",
  },
});
