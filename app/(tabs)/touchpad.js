import {
  useFocusEffect,
  useLocalSearchParams,
  useNavigation,
} from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { activateKeepAwakeAsync, deactivateKeepAwake } from "expo-keep-awake";
import {
  ActivityIndicator,
  FlatList,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, { runOnJS } from "react-native-reanimated";
import colors from "../../assets/constants/colors";
import { io } from "socket.io-client";
import {
  getInvertedScrollSettings,
  getKeepAwakeSettings,
} from "../../utils/settings";
import { MaterialIcons } from "@expo/vector-icons";
import {
  SERVER_URL_KEY,
  SETTINGS_KEEP_AWAKE_KEY,
  SETTINGS_TOUCHPAD_SCROLL_SENSITIVITY,
  SETTINGS_TOUCHPAD_SENSITIVITY,
  mediaKeysData,
} from "../../assets/constants/constants";
import useInterval from "../../hooks/useInterval";
import * as Notifications from "expo-notifications";
import { getValueFor, setValueFor } from "../../utils/secure-store";
import Background from "../../components/Background";
import KeyboardModal from "../../modals/KeyboardModal";
import RoundKey from "../../components/RoundKey";

let socket = null;
let textInputValueProps = Platform.os == "ios" ? { value: "" } : {};

Notifications.setNotificationHandler({
  handleNotification: async (notification) => {
    return {
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
      shouldShowAction: true,
    };
  },
});

Notifications.setNotificationCategoryAsync("controls", [
  {
    buttonTitle: `Play/Pause`,
    identifier: "play",
    options: {
      opensAppToForeground: false,
    },
  },
  {
    buttonTitle: "V+",
    identifier: "vup",
    options: {
      opensAppToForeground: false,
    },
  },
  {
    buttonTitle: "V-",
    identifier: "vdown",
    options: {
      opensAppToForeground: false,
    },
  },
])
  .then((_category) => {})
  .catch((error) =>
    console.warn("Could not have set notification category", error)
  );

export default function Touchpad() {
  const params = useLocalSearchParams();
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [settingsData, setSettingsData] = useState({});

  const tX = useRef(0);
  const tY = useRef(0);
  const sX = useRef(0);
  const sY = useRef(0);
  const tS = useRef(0);
  const sS = useRef(0);

  const navigation = useNavigation();
  useEffect(() => {
    const subscription = Notifications.addNotificationResponseReceivedListener(
      ({ actionIdentifier }) => {
        switch (actionIdentifier) {
          case "vup":
            socket?.emit("media-key", "audio_vol_up");
            break;
          case "vdown":
            socket?.emit("media-key", "audio_vol_down");
            break;
          case "play":
            socket?.emit("media-key", "audio_play");
            break;
          default:
            console.log(`Unhandled action identifier: ${actionIdentifier}`);
        }
      }
    );
    return () => subscription.remove();
  }, []);

  useFocusEffect(
    useCallback(() => {
      (async function setSensitivities() {
        if (navigation.isFocused) {
          tS.current = Number(
            (await getValueFor(SETTINGS_TOUCHPAD_SENSITIVITY)) ?? 1
          );
          sS.current = Number(
            (await getValueFor(SETTINGS_TOUCHPAD_SCROLL_SENSITIVITY)) ?? 0.2
          );
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
      })();
    }, [])
  );

  // socket connection handler
  const connectSocket = async () => {
    const serverUrl = await getValueFor(SERVER_URL_KEY);
    disconnectSocket();
    if (serverUrl) {
      socket = io.connect(serverUrl, {
        transports: ["websocket"],
      });
      socket.on("connect", () => {
        (async function scheduleNotificationWithAction() {
          await Notifications.dismissAllNotificationsAsync();
          await Notifications.scheduleNotificationAsync({
            content: {
              title: "Peyara Remote Mouse",
              subtitle: "Connected",
              autoDismiss: false,
              sticky: false,
              categoryIdentifier: "controls",
              priority: Notifications.AndroidImportance.MAX,
            },
            trigger: { seconds: 1 },
          });
        })();

        setStatus("Connected");
        setLoading(false);
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

  const disconnectSocket = async () => {
    if (socket) {
      socket?.disconnect();
    }
  };

  useEffect(() => {
    connectSocket();

    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, []);

  const setCoordinates = (coordinates) => {
    tX.current = coordinates.x;
    tY.current = coordinates.y;
  };

  useInterval(() => {
    if (tX.current != 0 || tY.current != 0) {
      socket?.emit("coordinates", {
        x: tX.current * tS.current,
        y: tY.current * tS.current,
      });
    }

    if (sX.current != 0 || sY.current != 0) {
      socket?.emit("scroll", {
        x: sX.current * sS.current,
        y: sY.current * sS.current,
      });
    }

    tX.current = 0;
    tY.current = 0;
    sX.current = 0;
    sY.current = 0;
  }, 32);

  const setScroll = (coordinates) => {
    sX.current = coordinates.x;
    sY.current = coordinates.y;
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
  const sendMediaKey = (key) => {
    socket?.emit("media-key", key);
  };

  // mouse movement gesture handler
  const dragGesture = Gesture.Pan()
    .onStart((_e) => {})
    .onUpdate((e) => {
      // console.log("Drag");
      let coordinates = {
        x: e.translationX,
        y: e.translationY,
      };
      runOnJS(setCoordinates)(coordinates);
    })
    .onEnd(() => {
      // coord = {
      //   x: 0,
      //   y: 0,
      // };
    });

  // two finger scroll gesture handler
  const dragGestureScroll = Gesture.Pan()
    .minPointers(2)
    .onStart((_e) => {})
    .onUpdate((e) => {
      // console.log("Scroll");
      let coordinates = {
        x: e.translationX,
        y: settingsData?.invertedScroll ? e.translationY * -1 : e.translationY,
      };
      runOnJS(setScroll)(coordinates);
    })
    .onEnd(() => {});

  // three finger window drag gesture handler
  const dragGestureWindowDrag = Gesture.Pan()
    .minPointers(3)
    .onStart((e) => {
      // console.log("window start");
      runOnJS(sendWindowDragStart)();
    })
    .onUpdate((e) => {
      // console.log("window update");
      let coordinates = {
        x: e.translationX,
        y: e.translationY,
      };
      runOnJS(sendWindowDragUpdate)(coordinates);
    })
    .onEnd((e) => {
      // console.log("window end");
      runOnJS(sendWindowDragEnd)();
    });
  const twoFingerTap = Gesture.Tap()
    .maxDuration(200)
    .minPointers(2)
    .onStart((_event) => {
      // console.log("Two finger");
      let state = {
        finger: "right",
        doubleTap: false,
      };
      runOnJS(sendClicks)(state);
    });
  const oneFingerTap = Gesture.Tap()
    .maxDuration(200)
    .onStart((_event, success) => {
      // console.log("Tap");
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
      // console.log("Double Tap");
      let state = {
        finger: "left",
        doubleTap: true,
      };
      runOnJS(sendClicks)(state);
    });

  const composed =
    Platform.OS == "ios"
      ? Gesture.Race(
          Gesture.Race(dragGesture, dragGestureScroll, dragGestureWindowDrag),
          Gesture.Exclusive(twoFingerTap, oneFingerDoubleTap, oneFingerTap)
        )
      : Gesture.Race(
          dragGestureWindowDrag,
          dragGestureScroll,
          dragGesture,
          Gesture.Exclusive(twoFingerTap, oneFingerDoubleTap, oneFingerTap)
        );
  const textInputRef = useRef();
  const timeoutRef = useRef();
  const keyboardModalRef = useRef();

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
  const showControls = () => {
    if (textInputRef.current?.isFocused()) {
      textInputRef.current?.blur();
    }
    keyboardModalRef?.current?.present();
  };
  const renderItem = ({ item }) => {
    return (
      <TouchableOpacity
        style={styles.rowKey}
        onPress={() => sendMediaKey(item.key)}
      >
        <MaterialIcons name={item.icon} size={24} color={colors.WHITE} />
      </TouchableOpacity>
    );
  };
  return (
    <Background>
      <SafeAreaView style={styles.container}>
        {loading && (
          <ActivityIndicator size="large" color={colors.PRIM_ACCENT} />
        )}

        {status == "Disconnected" && (
          <Text style={styles.text}>
            Go to home, select a server and connect again.
            <TouchableOpacity onPress={connectSocket}>
              <Text style={styles.txtRetry}>{"\n"} Reconnect</Text>
            </TouchableOpacity>
          </Text>
        )}

        {status == "Connected" && (
          <>
            <View style={styles.keysConatiner}>
              <RoundKey onPress={focusToggle}>
                <MaterialIcons
                  name="keyboard-hide"
                  size={24}
                  color={colors.WHITE}
                />
              </RoundKey>
              <RoundKey onPress={showControls}>
                <MaterialIcons
                  name="control-camera"
                  size={24}
                  color={colors.WHITE}
                />
              </RoundKey>
              <RoundKey onPress={disconnectSocket}>
                <MaterialIcons name="close" size={24} color={colors.WHITE} />
              </RoundKey>
              {/* <FlatList
                data={mediaKeysData}
                keyExtractor={(item, index) => index}
                renderItem={renderItem}
                horizontal
                showsHorizontalScrollIndicator={false}
              /> */}
            </View>
            <TextInput
              ref={textInputRef}
              onKeyPress={handleKeyPress}
              style={styles.input}
              multiline
              autoCapitalize="none"
              autoComplete={"off"}
              autoCorrect={false}
              spellCheck={false}
              {...textInputValueProps}
            />

            <GestureDetector gesture={composed}>
              <Animated.View style={styles.touchpad}></Animated.View>
            </GestureDetector>
          </>
        )}
        <KeyboardModal ref={keyboardModalRef} sendMediaKey={sendMediaKey} />
      </SafeAreaView>
    </Background>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "flex-start",
  },
  keysConatiner: {
    flex: 1,
    flexDirection: "row",
    width: "100%",
    maxHeight: 40,
    justifyContent: "center",
    alignItems: "center",
    gap: 16,
    paddingHorizontal: 16,
    marginTop: 16,
  },
  rowKey: {
    marginHorizontal: 4,
    paddingHorizontal: 8,
  },
  touchpad: {
    width: "100%",
    height: 400,
    margin: 16,
    borderRadius: 8,
    backgroundColor: colors.TOUCHPAD,
    justifyContent: "center",
    alignItems: "center",
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
    textAlign: "center",
    fontSize: 16,
  },
  txtRetry: {
    color: colors.PRIM_ACCENT,
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
  txtStatus: {
    color: colors.WHITE,
    marginTop: 16,
  },
});
