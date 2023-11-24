import { useFocusEffect, useLocalSearchParams } from "expo-router";
import { useCallback, useRef, useState } from "react";
import { activateKeepAwakeAsync, deactivateKeepAwake } from "expo-keep-awake";
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
  ScrollView,
} from "react-native-gesture-handler";
import { MultiWordHighlighter } from "react-native-multi-word-highlight";
import Animated, { runOnJS } from "react-native-reanimated";
import colors from "../../assets/constants/colors";
import { io } from "socket.io-client";
import {
  getInvertedScrollSettings,
  getKeepAwakeSettings,
} from "../../utils/settings";
import { MaterialIcons } from "@expo/vector-icons";
import {
  SETTINGS_KEEP_AWAKE_KEY,
  mediaKeysData,
} from "../../assets/constants/constants";
import {
  ScreenCapturePickerView,
  RTCPeerConnection,
  RTCIceCandidate,
  RTCSessionDescription,
  RTCView,
  MediaStream,
  MediaStreamTrack,
  mediaDevices,
  registerGlobals,
} from "react-native-webrtc";

let socket = null;
let peerConnection = null;
let textInputValueProps = Platform.os == "ios" ? { value: "" } : {};

let answerClient = null;

export default function Touchpad() {
  const params = useLocalSearchParams();
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [settingsData, setSettingsData] = useState({});
  const [remoteStream, setRemoteStream] = useState(null);
  const [localStream, setLocalStream] = useState(null);

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

          socket.on("offer", async (offer) => {
            console.log("Offer recieved", offer);

            peerConnection = new RTCPeerConnection(offer);
            await peerConnection.setRemoteDescription(
              new RTCSessionDescription(offer)
            );
            const stream = await mediaDevices.getUserMedia({
              video: true,
            });
            setLocalStream(stream);
            console.log(stream);
            for (let track of stream.getTracks()) {
              await peerConnection.addTrack(track, stream);
            }
            const answer = await peerConnection.createAnswer();
            await peerConnection.setLocalDescription(answer);
            answerClient = answer;

            peerConnection.onaddstream = (event) => {
              // Access the received stream
              console.log("On add stream", event);
              const remoteStream = event.stream;

              // Update your component state to trigger a re-render with the new stream
              // For example, if you're using React Hooks:
              setRemoteStream(remoteStream);
            };

            peerConnection.addEventListener("icecandidate", (event) => {
              console.log("ice on phone", event.candidate);
              socket.emit("answer-ice-candidate", event.candidate);
            });
            peerConnection.ontrack = async (event) => {
              // event.streams contains a MediaStream with the received track
              // const [stream] = event.streams;

              // // Assuming you have a video element in your component
              // cameraElement.srcObject = stream;
              console.log("Received tracks:", JSON.stringify(event));
            };

            socket.emit("answer", answer);
          });
          socket.on(
            "recieve-offer-ice-candidate",
            async function (iceCandidate) {
              console.log("Offer ice candidate on phone", iceCandidate);
              if (iceCandidate) {
                await peerConnection.addIceCandidate(
                  new RTCIceCandidate(iceCandidate)
                );
              }
            }
          );
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
      runOnJS(sendCoordinates)(coordinates);
    })
    .onEnd(() => {});

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
      runOnJS(sendScroll)(coordinates);
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
    <ScrollView style={styles.container}>
      {loading && <ActivityIndicator size="large" color={colors.PRIM_ACCENT} />}
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
                overflow: "hidden",
                marginVertical: 8,
              },
            },
            {
              word: "Disconnected",
              textStyle: {
                backgroundColor: colors.RED,
                color: colors.WHITE,
                padding: 16,
                borderRadius: 8,
                overflow: "hidden",
                marginVertical: 8,
              },
            },
            {
              word: "Error",
              textStyle: {
                backgroundColor: colors.RED,
                color: colors.WHITE,
                padding: 16,
                borderRadius: 8,
                overflow: "hidden",
                marginVertical: 8,
              },
            },
          ]}
          textToHighlight={status}
        />
      )}
      {status == "Disconnected" && (
        <Text style={styles.text}>
          Go to home, select a server and connect.
        </Text>
      )}

      {status == "Connected" && (
        <>
          <View style={styles.keysConatiner}>
            <TouchableOpacity onPress={focusToggle}>
              <MaterialIcons
                name="keyboard-hide"
                size={24}
                color={colors.WHITE}
              />
            </TouchableOpacity>
            <FlatList
              data={mediaKeysData}
              keyExtractor={(item, index) => index}
              renderItem={renderItem}
              horizontal
              showsHorizontalScrollIndicator={false}
            />
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

          <RTCView
            style={{ width: 300, height: 200 }}
            streamURL={remoteStream ? remoteStream.toURL() : null}
          />
          <RTCView
            streamURL={localStream ? localStream.toURL() : null}
            style={{ width: 300, height: 300 }}
          />
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // flexDirection: "column",
    // alignItems: "center",
    // justifyContent: "flex-start",
    backgroundColor: colors.PRIM_BG,
  },
  keysConatiner: {
    flex: 1,
    flexDirection: "row",
    width: "100%",
    maxHeight: 40,
    justifyContent: "space-around",
    alignItems: "center",
    gap: 16,
    paddingHorizontal: 16,
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
