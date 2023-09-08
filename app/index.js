import { Link } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useRef, useState } from "react";
import { Alert, Button, Pressable, StyleSheet, Text, View } from "react-native";
import {
  Gesture,
  GestureDetector,
  TextInput,
} from "react-native-gesture-handler";
import Animated, { runOnJS } from "react-native-reanimated";
import { io } from "socket.io-client";

let socket = null;

export default function Home() {
  const [address, setAddress] = useState("http://192.168.0.102:1313");
  const [err, setErr] = useState("");
  const connectSocket = () => {
    if (socket) {
      socket.disconnect();
    }
    console.log(address);
    socket = io.connect(address, {
      transports: ["websocket"],
    });
    socket.on("connect", () => {
      setErr(socket.id); // true
    });

    socket.on("connect_error", (error) => {
      let err = JSON.stringify(error);
      Alert.alert(err);
      setErr(err);
    });

    socket.on("disconnect", () => {
      console.log(socket.connected); // false
    });
  };
  const sendCoordinates = (coordinates) => {
    socket.emit("coordinates", coordinates);
  };
  const sendScroll = (coordinates) => {
    socket.emit("scroll", coordinates);
  };
  const sendClicks = (state) => {
    socket.emit("clicks", state);
  };

  const sendWindowDragStart = (coordinates) => {
    socket.emit("windowdragstart", coordinates);
  };
  const sendWindowDragUpdate = (coordinates) => {
    socket.emit("windowdragupdate", coordinates);
  };
  const sendWindowDragEnd = (coordinates) => {
    socket.emit("windowdragend", coordinates);
  };

  const dragGesture = Gesture.Pan()
    .onStart((_e) => {})
    .onUpdate((e) => {
      let coordinates = {
        x: e.translationX,
        y: e.translationY,
      };
      runOnJS(sendCoordinates)(coordinates);
    })
    .onEnd(() => {});
  const dragGestureScroll = Gesture.Pan()
    .minPointers(2)
    .onStart((_e) => {})
    .onUpdate((e) => {
      let coordinates = {
        x: e.translationX,
        y: e.translationY,
      };
      runOnJS(sendScroll)(coordinates);
    })
    .onEnd(() => {});
  const dragGestureWindowDrag = Gesture.Pan()
    .minPointers(3)
    .onStart((e) => {
      runOnJS(sendWindowDragStart)();
    })
    .onUpdate((e) => {
      let coordinates = {
        x: e.translationX,
        y: e.translationY,
      };
      runOnJS(sendWindowDragUpdate)(coordinates);
    })
    .onEnd((e) => {
      runOnJS(sendWindowDragEnd)();
    });
  const twoFingerTap = Gesture.Tap()
    .maxDuration(200)
    .minPointers(2)
    .onStart((_event, success) => {
      let state = {
        finger: "right",
        doubleTap: false,
      };
      runOnJS(sendClicks)(state);
    });
  const oneFingerTap = Gesture.Tap()
    .maxDuration(200)
    .onStart((_event, success) => {
      let state = {
        finger: "left",
        doubleTap: false,
      };
      runOnJS(sendClicks)(state);
    });
  const oneFingerDoubleTap = Gesture.Tap()
    .maxDuration(200)
    .numberOfTaps(2)
    .onStart((_event, success) => {
      let state = {
        finger: "left",
        doubleTap: true,
      };
      runOnJS(sendClicks)(state);
    });

  const composed = Gesture.Race(
    dragGestureWindowDrag,
    dragGestureScroll,
    dragGesture,
    Gesture.Exclusive(twoFingerTap, oneFingerDoubleTap, oneFingerTap)
  );
  return (
    <View style={styles.container}>
      <Link href="/home">Home</Link>
      <TextInput
        style={styles.input}
        onChangeText={setAddress}
        value={address}
        placeholder="address"
      />
      <Button onPress={connectSocket} title="Connect " />
      <GestureDetector gesture={composed}>
        <Animated.View style={styles.touchpad}>
          <Text style={{ color: "red" }}>error: {err}</Text>
        </Animated.View>
      </GestureDetector>

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
    backgroundColor: "#1f1f1f",
    alignItems: "center",
    justifyContent: "center",
  },
  touchpad: {
    width: "100%",
    height: 400,
    margin: 16,
    borderRadius: 8,
    backgroundColor: "white",
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
  input: {
    width: "100%",
    backgroundColor: "white",
  },
});
