import {
  useFocusEffect,
  useGlobalSearchParams,
  useLocalSearchParams,
} from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { MultiWordHighlighter } from "react-native-multi-word-highlight";
import Animated, { runOnJS } from "react-native-reanimated";
import { io } from "socket.io-client";
import colors from "../../assets/constants/colors";

let socket = null;

export default function Touchpad() {
  const params = useLocalSearchParams();
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      const connectSocket = () => {
        console.log(params);

        if (params?.url) {
          socket = io.connect(params?.url, {
            transports: ["websocket"],
          });
          socket.on("connect", () => {
            setStatus("Connected");
            if (loading) setLoading(false);
          });

          socket.on("connect_error", (error) => {
            console.log(error);
            setStatus("Error");
            socket.disconnect();
            if (loading) setLoading(false);
          });

          socket.on("disconnect", () => {
            setStatus("Disconnected");
            if (loading) setLoading(false);
          });
        }
      };
      connectSocket();
      return () => {
        if (socket) {
          socket.disconnect();
        }
      };
    }, [params])
  );
  const sendCoordinates = (coordinates) => {
    socket?.emit("coordinates", coordinates);
  };
  const sendScroll = (coordinates) => {
    socket?.emit("scroll", coordinates);
  };
  const sendClicks = (state) => {
    socket?.emit("clicks", state);
  };

  const sendWindowDragStart = (coordinates) => {
    socket?.emit("windowdragstart", coordinates);
  };
  const sendWindowDragUpdate = (coordinates) => {
    socket?.emit("windowdragupdate", coordinates);
  };
  const sendWindowDragEnd = (coordinates) => {
    socket?.emit("windowdragend", coordinates);
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
      {!loading && (
        <MultiWordHighlighter
          searchWords={[
            {
              word: "Connected",
              textStyle: {
                backgroundColor: colors.PRIM_ACCENT,
                color: colors.PRIM_BG,
                padding: 16,
                borderRadius: 8,
              },
            },
            {
              word: "Disconnected",
              textStyle: {
                backgroundColor: colors.RED,
                color: colors.WHITE,
                padding: 16,
                borderRadius: 8,
              },
            },
            {
              word: "Error",
              textStyle: {
                backgroundColor: colors.RED,
                color: colors.WHITE,
                padding: 16,
                borderRadius: 8,
              },
            },
          ]}
          textToHighlight={status}
        />
      )}
      {loading && <ActivityIndicator size="large" color={colors.PRIM_ACCENT} />}
      {status == "Disconnected" && (
        <Text style={styles.text}>
          Go to home, select a server and connect.
        </Text>
      )}
      <GestureDetector gesture={composed}>
        <Animated.View style={styles.touchpad}></Animated.View>
      </GestureDetector>
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
    opacity: 0.1,
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
  text: {
    color: colors.WHITE,
    marginTop: 8,
  },
});
