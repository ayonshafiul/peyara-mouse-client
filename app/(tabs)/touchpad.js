import {
  useFocusEffect,
  useGlobalSearchParams,
  useLocalSearchParams,
} from "expo-router";
import { useCallback, useRef, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { MultiWordHighlighter } from "react-native-multi-word-highlight";
import Animated, { runOnJS } from "react-native-reanimated";
import colors from "../../assets/constants/colors";
import { io } from "socket.io-client";
import {
  getInvertedScrollSettings,
  getKeepAwakeSettings,
} from "../../utils/settings";

let socket = null;

export default function Touchpad() {
  const params = useLocalSearchParams();
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [settingsData, setSettingsData] = useState({});

  useFocusEffect(
    useCallback(() => {
      // socket connection handler
      const connectSocket = () => {
        console.log(params);
        if (params?.url) {
          socket = io.connect(params?.url, {
            transports: ["websocket"],
          });
          socket.on("connect", () => {
            setStatus("Connected");
            setLoading(false);
            // after successfull connection get the settings data also
            async function getSettings() {
              const invertedScroll = await getInvertedScrollSettings();
              const keepAwake = await getKeepAwakeSettings();
              setSettingsData({
                invertedScroll: invertedScroll,
                keepAwake: keepAwake,
              });
            }
            getSettings();
          });

          socket.on("connect_error", (error) => {
            console.log(error);
            setStatus("Error");
            socket.disconnect();
            setLoading(false);
          });

          socket.on("disconnect", () => {
            setStatus("Disconnected");
            setLoading(false);
          });
        } else {
          setLoading(false);
          setStatus("Disconnected");
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

  // mouse movement gesture handler
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

  // two finger scroll gesture handler
  const dragGestureScroll = Gesture.Pan()
    .minPointers(2)
    .onStart((_e) => {})
    .onUpdate((e) => {
      let coordinates = {
        x: e.translationX,
        y: settingsData?.invertedScroll ? e.translationY * -1 : e.translationY,
      };
      runOnJS(sendScroll)(coordinates);
    })
    .onEnd(() => {});

  // three finger window drag gesture handler
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
    .onStart((_event) => {
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
      {status == "Connected" && (
        <GestureDetector gesture={composed}>
          <Animated.View style={styles.touchpad}></Animated.View>
        </GestureDetector>
      )}
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
