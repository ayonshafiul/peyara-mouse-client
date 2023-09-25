import { useFocusEffect, useLocalSearchParams } from "expo-router";
import { useCallback, useRef, useState } from "react";
import { activateKeepAwakeAsync, deactivateKeepAwake } from "expo-keep-awake";
import {
  ActivityIndicator,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { MultiWordHighlighter } from "react-native-multi-word-highlight";
import Animated, { runOnJS } from "react-native-reanimated";
import colors from "../../assets/constants/colors";
import { io } from "socket.io-client";
import {
  getInvertedScrollSettings,
  getKeepAwakeSettings,
} from "../../utils/settings";
import { MaterialIcons } from "@expo/vector-icons";
import { SETTINGS_KEEP_AWAKE_KEY } from "../../assets/constants/constants";

let socket = null;
let textInputValueProps = Platform.os == "ios" ? { value: "" } : {};
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
              if (keepAwake) {
                activateKeepAwakeAsync(SETTINGS_KEEP_AWAKE_KEY);
              } else if (keepAwake == false) {
                // do not do anything if it is null
                deactivateKeepAwake(SETTINGS_KEEP_AWAKE_KEY);
              }
              setSettingsData({
                invertedScroll: invertedScroll,
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
  const sendKey = (key) => {
    socket?.emit("key", key);
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
  const textInputRef = useRef();
  const timeoutRef = useRef();
  const lastKeyEventTimestamp = useRef(0);
  const handleKeyPress = (event) => {
    let key = event.nativeEvent.key;
    sendKey(key);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(clearInput, 500);
  };

  const clearInput = () => {
    if (Platform.OS != "ios") {
      textInputRef.current?.clear();
    }
  };
  const focusToggle = () => {
    if (textInputRef.current?.isFocused()) {
      textInputRef.current?.blur();
    } else {
      textInputRef.current?.focus();
    }
  };
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
        <>
          <TextInput
            ref={textInputRef}
            onKeyPress={handleKeyPress}
            style={styles.input}
            multiline
            autoCapitalize={false}
            autoComplete={"off"}
            autoCorrect={false}
            spellCheck={false}
            {...textInputValueProps}
          />
          <TouchableOpacity onPress={focusToggle}>
            <MaterialIcons
              name="keyboard-hide"
              size={48}
              color={colors.WHITE}
            />
          </TouchableOpacity>
          <GestureDetector gesture={composed}>
            <Animated.View style={styles.touchpad}></Animated.View>
          </GestureDetector>
        </>
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
  input: {
    height: 40,
    width: "100%",
    margin: 12,
    borderWidth: 1,
    padding: 10,
    // opacity: 0,
    display: "none",
    color: colors.PRIM_BG,
    backgroundColor: "white",
  },
});
