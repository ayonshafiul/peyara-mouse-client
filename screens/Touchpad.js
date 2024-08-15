import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {
  activateKeepAwake,
  deactivateKeepAwake,
} from '@sayem314/react-native-keep-awake';
import Orientation from 'react-native-orientation-locker';
import {
  ActivityIndicator,
  Dimensions,
  Keyboard,
  Platform,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {Gesture, GestureDetector} from 'react-native-gesture-handler';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import colors from '../assets/constants/colors';
import {io} from 'socket.io-client';
import {
  getInvertedScrollSettings,
  getKeepAwakeSettings,
  getResponseRateSettings,
} from '../utils/settings';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {
  DEFAULT_TOUCHPAD_RESPONSE_RATE,
  DEFAULT_TOUCHPAD_SCROLL_SENSITIVITY,
  DEFAULT_TOUCHPAD_SENSITIVITY,
  SERVER_URL_KEY,
  SETTINGS_TOUCHPAD_SCROLL_SENSITIVITY,
  SETTINGS_TOUCHPAD_SENSITIVITY,
} from '../assets/constants/constants';
import useInterval from '../hooks/useInterval';
import {getValueFor} from '../utils/storage';
import Background from '../components/Background';
import KeyboardModal from '../modals/KeyboardModal';
import RoundKey from '../components/RoundKey';
import {
  useFocusEffect,
  useIsFocused,
  useNavigation,
} from '@react-navigation/native';
import notifee, {
  AndroidColor,
  AuthorizationStatus,
  EventType,
} from '@notifee/react-native';
import KeepAwakeText from '../components/KeepAwakeText';

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
} from 'react-native-webrtc';
import PortraitTouchpad from '../components/PortraitTouchpad';
import LandscapeTouchpad from '../components/LandscapeTouchpad';
import {useGlobalStore} from '../store/useGlobalStore';
import FileUploadModal from '../modals/FileUploadModal';

let socket = null;
let textInputValueProps = Platform.os === 'ios' ? {value: ''} : {};
let peerConnection = null;

let answerClient = null;

function clamp(val, min, max) {
  return Math.min(Math.max(val, min), max);
}

const eventHandler = async ({type, detail}) => {
  if (type === EventType.ACTION_PRESS) {
    switch (detail.pressAction.id) {
      case 'play':
        socket?.emit('media-key', 'audio_play');
        break;
      case 'mute':
        socket?.emit('media-key', 'audio_mute');
        break;
    }
  }
};
notifee.onBackgroundEvent(eventHandler);

const DRAG_START_THRESHOLD_IN_MS = 200;
const MAX_TRANSLATE_Y = 180;
let hideControlsTimer;

export default function Touchpad({navigation, route}) {
  const setShowBottomBar = useGlobalStore(state => state.setShowBottomBar);
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const [showTextInput, setShowTextInput] = useState(false);
  const [settingsData, setSettingsData] = useState({});
  const [receivedText, setReceivedText] = useState('');
  const responseRate = getResponseRateSettings();
  const isFocused = useIsFocused();

  const [showTopControls, setShowTopControls] = useState(true);
  const [showRemoteStream, setShowRemoteStream] = useState(false);
  const [remoteStream, setRemoteStream] = useState(null);

  const serverUrl = useMemo(
    () => route?.params?.serverUrl ?? getValueFor(SERVER_URL_KEY) ?? null,
    [route?.params],
  );

  console.log('🚀 ~ Touchpad ~ serverUrl:', serverUrl);

  // touchpad coordinates
  const tX = useRef(0);
  const tY = useRef(0);

  // scroll coordinates
  const sX = useRef(0);
  const sY = useRef(0);

  // touchpad sensitivity
  const tS = useRef(0);
  // scroll sensitivity
  const sS = useRef(0);

  // scroll wheel translations

  const translationY = useSharedValue(0);

  // click state
  const clickStateFinger = useRef('');
  const clickStateIsDoubleTap = useRef(false);

  const lastTapped = useSharedValue(0);
  const lastTappedInRef = useRef(0);
  const isDragging = useSharedValue(false);
  const isDraggingRef = useRef(false);
  const pendingLeftClick = useRef(false);

  const hideTopControlsAfterDelay = () => {
    setShowTopControls(true);
    clearTimeout(hideControlsTimer);
    hideControlsTimer = setTimeout(() => {
      setShowTopControls(false);
    }, 3000);
  };

  const setPortraitMode = () => {
    clearTimeout(hideControlsTimer);
    setShowRemoteStream(false);
    setShowTopControls(true);
    Orientation.lockToPortrait();
    setShowBottomBar(true);
  };

  const setLandscapeMode = () => {
    setShowRemoteStream(true);
    Orientation.lockToLandscapeLeft();
    hideTopControlsAfterDelay();
    keyboardModalRef.current?.dismiss();
  };

  useEffect(() => {
    (async function requestUserPermission() {
      const settings = await notifee.requestPermission();
      if (settings.authorizationStatus >= AuthorizationStatus.AUTHORIZED) {
      } else {
        console.log('User declined permissions');
      }
    })();

    return notifee.onForegroundEvent(eventHandler);
  }, []);

  useEffect(() => {
    (async function setSensitivities() {
      if (isFocused) {
        tS.current = Number(
          getValueFor(SETTINGS_TOUCHPAD_SENSITIVITY) ??
            DEFAULT_TOUCHPAD_SENSITIVITY,
        );
        sS.current = Number(
          getValueFor(SETTINGS_TOUCHPAD_SCROLL_SENSITIVITY) ??
            DEFAULT_TOUCHPAD_SCROLL_SENSITIVITY,
        );
        const invertedScroll = getInvertedScrollSettings();
        const keepAwake = getKeepAwakeSettings();
        if (keepAwake) {
          activateKeepAwake();
        } else {
          deactivateKeepAwake();
        }
        setSettingsData({
          invertedScroll: invertedScroll,
        });
        console.log(route.params, 'params');
        if (route?.params?.serverUrl) {
          connectSocket();
        }
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isFocused]);

  // socket connection handler
  const connectSocket = async () => {
    setLoading(true);

    console.log('🚀 ~ connectSocket ~ serverUrl:', serverUrl);
    // disconnect existing connections
    disconnectSocket();
    if (serverUrl) {
      socket = io.connect(serverUrl, {
        transports: ['websocket'],
      });
      socket.on('connect', () => {
        notifee.cancelAllNotifications();
        notifee.displayNotification({
          title: 'Peyara Remote Mosue',
          body: 'Connected',
          android: {
            channelId: 'media',
            actions: [
              {
                title: 'Play/Pause',
                pressAction: {
                  id: 'play',
                  launchActivity: 'none',
                },
              },
              {
                title: 'Mute',
                pressAction: {
                  id: 'mute',
                },
              },
            ],
            color: AndroidColor.RED,
            colorized: true,
            autoCancel: false,
          },
        });

        setStatus('Connected');
        setLoading(false);
        if (isFocused && !showRemoteStream) {
          keyboardModalRef?.current?.present();
        }
      });

      socket.on('connect_error', error => {
        console.log(error);
        setStatus('Disconnected');
        socket.disconnect();
        setLoading(false);
      });

      socket.on('disconnect', () => {
        setStatus('Disconnected');
        setLoading(false);
      });

      socket.on('text-mobile', text => {
        setReceivedText(text);
        keyboardModalRef?.current.present();
      });

      socket.on('stop-screen-share', () => {
        console.log('stop');
        setPortraitMode();
      });

      /// webrtc handlers
      socket.on('offer', async offer => {
        console.log('Offer recieved on phone. generating answer', offer);

        peerConnection = new RTCPeerConnection({
          offerToReceiveVideo: true,
        });
        peerConnection.ontrack = async event => {
          // event.streams contains a MediaStream with the received track
          const [stream] = event.streams;
          console.log('Received Stream inside on track', stream);
          setRemoteStream(stream);
        };
        await peerConnection.setRemoteDescription(
          new RTCSessionDescription(offer),
        );
        // const stream = await mediaDevices.getUserMedia({
        //   video: true,
        // });

        // console.log(stream);
        // for (let track of stream.getTracks()) {
        //   await peerConnection.addTrack(track, stream);
        // }
        const answer = await peerConnection.createAnswer();
        await peerConnection.setLocalDescription(answer);
        answerClient = answer;

        // peerConnection.onaddstream = event => {
        //   // Access the received stream
        //   console.log('On add stream', event);
        //   const remoteStream = event.stream;

        //   // Update your component state to trigger a re-render with the new stream
        //   // For example, if you're using React Hooks:
        //   setRemoteStream(remoteStream);
        // };

        peerConnection.addEventListener('icecandidate', event => {
          console.log('generating ice on phone', event.candidate);
          socket.emit('answer-ice-candidate', event.candidate);
        });

        peerConnection.addEventListener('connectionstatechange', event => {
          console.log(event, ' event', peerConnection.connectionState);
          switch (peerConnection.connectionState) {
            case 'connected':
              setLandscapeMode();
              break;
            case 'closed':
            case 'failed':
            case 'disconnected':
              setPortraitMode();
              break;
          }
        });

        socket.emit('answer', answer);
      });
      socket.on('recieve-offer-ice-candidate', async function (iceCandidate) {
        console.log('Recieve Offer ice candidate on phone', iceCandidate);
        if (iceCandidate) {
          await peerConnection?.addIceCandidate(
            new RTCIceCandidate(iceCandidate),
          );
        }
      });
    } else {
      setLoading(false);
      setStatus('Disconnected');
    }
  };

  const disconnectSocket = async () => {
    if (socket) {
      socket?.disconnect();
      peerConnection?.close();
      keyboardModalRef?.current?.dismiss();
      setPortraitMode();
    }
  };
  const openHelp = () => {
    navigation.navigate('TouchpadHelp');
  };

  const setCoordinates = coordinates => {
    tX.current = coordinates.x;
    tY.current = coordinates.y;
  };
  const setFingerState = state => {
    clickStateFinger.current = state.finger;
    clickStateIsDoubleTap.current = state.doubleTap;
  };

  const setLastTappedInRef = time => {
    lastTappedInRef.current = time;
  };

  const setDraggingRef = value => {
    isDragging.current = value;
  };
  const setPendingLeftClick = value => {
    pendingLeftClick.current = value;
  };

  useInterval(() => {
    if (pendingLeftClick.current) {
      if (Date.now() - lastTappedInRef.current > DRAG_START_THRESHOLD_IN_MS) {
        socket?.emit('clicks', {
          finger: 'left',
          doubleTap: false,
        });
        pendingLeftClick.current = false;
      }
    }

    if (isDraggingRef.current) {
      pendingLeftClick.current = false;
      socket?.emit('windowdragupdate', {
        x: tX.current * tS.current,
        y: tY.current * tS.current,
      });
    } else if (tX.current != 0 || tY.current != 0) {
      pendingLeftClick.current = false;
      socket?.emit('coordinates', {
        x: tX.current * tS.current,
        y: tY.current * tS.current,
      });
    } else if (clickStateFinger.current) {
      socket?.emit('clicks', {
        finger: clickStateFinger.current,
        doubleTap: clickStateIsDoubleTap.current,
      });
      clickStateFinger.current = '';
      clickStateIsDoubleTap.current = false;
    }

    if (sX.current != 0 || sY.current != 0) {
      socket?.emit('scroll', {
        x: sX.current * sS.current,
        y: sY.current * sS.current,
      });
    }

    tX.current = 0;
    tY.current = 0;
    sX.current = 0;
    sY.current = 0;
  }, Number(responseRate ?? DEFAULT_TOUCHPAD_RESPONSE_RATE));

  const setScroll = coordinates => {
    sX.current = coordinates.x;
    sY.current = coordinates.y;
  };
  const sendWindowDragStart = coordinates => {
    isDraggingRef.current = true;
    socket?.emit('windowdragstart', coordinates);
  };
  const sendWindowDragEnd = coordinates => {
    isDraggingRef.current = false;
    socket?.emit('windowdragend', coordinates);
  };
  const sendKey = key => {
    console.log('key', key);
    socket?.emit('key', key);
  };
  const sendMediaKey = key => {
    socket?.emit('media-key', key);
  };
  const sendEditKey = payload => {
    socket?.emit('edit-key', {key: payload.key, modifier: payload.modifier});
  };
  const sendText = text => {
    socket?.emit('text', text);
  };
  const sendLeftClick = () => {
    socket?.emit('clicks', {
      finger: 'left',
      doubleTap: false,
    });
  };

  const sendRightClick = () => {
    socket?.emit('clicks', {
      finger: 'right',
      doubleTap: false,
    });
  };

  // mouse movement gesture handler
  const dragGesture = Gesture.Pan()
    .onStart(e => {
      const timeSinceLastTapped = Date.now() - lastTapped.value;
      if (timeSinceLastTapped < DRAG_START_THRESHOLD_IN_MS) {
        // console.log('Drag start');
        isDragging.value = true;
        runOnJS(setDraggingRef)(true);
        runOnJS(sendWindowDragStart)();
      }
    })
    .onUpdate(e => {
      let coordinates = {
        x: e.translationX,
        y: e.translationY,
      };
      runOnJS(setCoordinates)(coordinates);
    })
    .onEnd(() => {
      if (isDragging.value) {
        runOnJS(sendWindowDragEnd)();
        runOnJS(setDraggingRef)(false);
        // console.log('Drag end');
        isDragging.value = false;
      }
    });

  // two finger scroll gesture handler
  const dragGestureScroll = Gesture.Pan()
    .minPointers(2)
    .onStart(_e => {})
    .onUpdate(e => {
      let coordinates = {
        x: e.translationX,
        y: settingsData?.invertedScroll ? e.translationY * -1 : e.translationY,
      };
      runOnJS(setScroll)(coordinates);
    })
    .onEnd(() => {});

  // const twoFingerTap = Gesture.Tap()
  //   .maxDuration(200)
  //   .minPointers(2)
  //   .onStart(_event => {});
  const oneFingerTap = Gesture.Tap()
    .maxDuration(150)
    .onStart((_event, success) => {})
    .onEnd(e => {
      lastTapped.value = Date.now();
      runOnJS(setLastTappedInRef)(Date.now());
      runOnJS(setPendingLeftClick)(true);
    });
  const oneFingerDoubleTap = Gesture.Tap()
    .maxDuration(150)
    .numberOfTaps(2)
    .onEnd((_event, success) => {
      let state = {
        finger: 'left',
        doubleTap: true,
      };
      runOnJS(setFingerState)(state);
    });

  const composed =
    Platform.OS === 'ios'
      ? Gesture.Race(
          Gesture.Race(dragGesture, dragGestureScroll),
          Gesture.Exclusive(oneFingerDoubleTap, oneFingerTap),
        )
      : Gesture.Race(
          dragGestureScroll,
          dragGesture,
          Gesture.Exclusive(oneFingerDoubleTap, oneFingerTap),
        );
  const scrollGesture = Gesture.Pan()
    .minDistance(1)
    .onStart(_ => {})
    .onUpdate(event => {
      translationY.value = clamp(
        event.translationY,
        -MAX_TRANSLATE_Y,
        MAX_TRANSLATE_Y,
      );
      let coordinates = {
        x: 0,
        y: settingsData?.invertedScroll
          ? translationY.value
          : translationY.value * -1,
      };
      runOnJS(setScroll)(coordinates);
    })
    .onEnd(_ => {
      translationY.value = withTiming(0, {
        duration: 100,
      });
    })
    .runOnJS(true);
  const scrollWheelStyles = useAnimatedStyle(() => ({
    transform: [{translateY: translationY.value}],
  }));
  const textInputRef = useRef();
  const timeoutRef = useRef();
  const keyboardModalRef = useRef();
  const fileUploadModalRef = useRef();

  const handleKeyPress = event => {
    let key = event.nativeEvent.key;
    sendKey(key);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(clearInput, 500);
  };

  const clearInput = () => {
    if (Platform.OS !== 'ios') {
      textInputRef.current?.clear();
    }
  };
  const focusToggle = () => {
    keyboardModalRef?.current?.dismiss();
    fileUploadModalRef?.current?.dismiss();
    setShowTextInput(p => !p);
  };
  const showControls = () => {
    if (textInputRef.current?.isFocused()) {
      textInputRef.current?.blur();
    }
    keyboardModalRef?.current?.present();
    fileUploadModalRef?.current?.dismiss();
  };

  const showFileUpload = () => {
    if (textInputRef.current?.isFocused()) {
      textInputRef.current?.blur();
    }
    keyboardModalRef?.current?.dismiss();
    fileUploadModalRef?.current?.present();
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar translucent={true} backgroundColor={'transparent'} hidden />
      {loading && <ActivityIndicator size="large" color={colors.PRIM_ACCENT} />}

      {status === 'Disconnected' && (
        <View style={styles.retryWrapper}>
          <Text style={styles.text}>
            Go to home, select a server and connect again.
          </Text>

          <TouchableOpacity onPress={connectSocket}>
            <Text style={styles.txtRetry}>Reconnect to this server</Text>
          </TouchableOpacity>
        </View>
      )}

      {status === 'Connected' && (
        <>
          {showTopControls && (
            <View style={styles.keysConatiner}>
              <RoundKey containerStyle={styles.roundKey} onPress={focusToggle}>
                <MaterialIcons
                  name="keyboard-hide"
                  size={24}
                  color={colors.WHITE}
                />
              </RoundKey>
              <RoundKey containerStyle={styles.roundKey} onPress={showControls}>
                <MaterialIcons
                  name="control-camera"
                  size={24}
                  color={colors.WHITE}
                />
              </RoundKey>

              <RoundKey
                containerStyle={styles.roundKey}
                onPress={showFileUpload}>
                <MaterialIcons name="folder" size={24} color={colors.WHITE} />
              </RoundKey>

              <RoundKey
                containerStyle={styles.roundKey}
                onPress={showRemoteStream ? setPortraitMode : setLandscapeMode}>
                <MaterialIcons
                  name={
                    showRemoteStream
                      ? 'stay-primary-portrait'
                      : 'stay-primary-landscape'
                  }
                  size={24}
                  color={colors.WHITE}
                />
              </RoundKey>
              <RoundKey containerStyle={styles.roundKey} onPress={openHelp}>
                <MaterialIcons name="help" size={24} color={colors.WHITE} />
              </RoundKey>
              <RoundKey
                containerStyle={styles.roundKey}
                onPress={disconnectSocket}>
                <MaterialIcons name="close" size={24} color={colors.WHITE} />
              </RoundKey>
            </View>
          )}

          {/* Hidden Input for Keyboard */}
          {showTextInput && (
            <TextInput
              ref={textInputRef}
              onKeyPress={handleKeyPress}
              style={styles.input}
              multiline
              autoCapitalize="none"
              autoComplete={'off'}
              autoCorrect={false}
              spellCheck={false}
              autoFocus={true}
              {...textInputValueProps}
            />
          )}
          {/* Hidden Input for Keyboard */}

          {/* Touchpad */}
          {/* <Animated.View style={styles.touchpadContainer}>
              <GestureDetector gesture={composed}>
                <Animated.View style={styles.touchpad}>
                  <KeepAwakeText />
                </Animated.View>
              </GestureDetector>

              <Animated.View style={styles.scrollWheelContainer}>
                <Animated.View style={styles.scrollWheelTrack}>
                  <GestureDetector gesture={scrollGesture}>
                    <Animated.View
                      style={[styles.scrollWheelThumb, scrollWheelStyles]}>
                      <View style={styles.thumbLine} />
                      <View style={styles.thumbLine} />
                      <View style={styles.thumbLine} />
                    </Animated.View>
                  </GestureDetector>
                </Animated.View>
              </Animated.View>
            </Animated.View> */}
          {/* Touchpad */}

          {/* Mouse Buttons */}
          {/* <View style={styles.clicksWrapper}>
              <TouchableOpacity style={styles.clickBtn} onPress={sendLeftClick}>
                <Text style={styles.clickBtnText}>Left Click</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.clickBtn}
                onPress={sendRightClick}>
                <Text style={styles.clickBtnText}>Right Click</Text>
              </TouchableOpacity>
            </View> */}
          {/* Mouse Buttons */}
          {showRemoteStream ? (
            <LandscapeTouchpad
              composed={composed}
              scrollGesture={scrollGesture}
              scrollWheelStyles={scrollWheelStyles}
              sendLeftClick={sendLeftClick}
              sendRightClick={sendRightClick}
              hideTopControlsAfterDelay={hideTopControlsAfterDelay}
            />
          ) : (
            <PortraitTouchpad
              composed={composed}
              scrollGesture={scrollGesture}
              scrollWheelStyles={scrollWheelStyles}
              sendLeftClick={sendLeftClick}
              sendRightClick={sendRightClick}
            />
          )}
        </>
      )}
      {showRemoteStream && (
        <RTCView
          style={{
            ...StyleSheet.absoluteFillObject,
            zIndex: -1,
          }}
          streamURL={remoteStream ? remoteStream?.toURL() : null}
          objectFit="contain"
        />
      )}
      <KeyboardModal
        ref={keyboardModalRef}
        sendMediaKey={sendMediaKey}
        sendEditKey={sendEditKey}
        sendLeftClick={sendLeftClick}
        sendRightClick={sendRightClick}
        sendText={sendText}
        receivedText={receivedText}
      />
      <FileUploadModal ref={fileUploadModalRef} url={serverUrl} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'flex-start',
    backgroundColor: colors.PRIM_BG,
    paddingHorizontal: 8,
  },
  keysConatiner: {
    flex: 1,
    flexDirection: 'row',
    width: '100%',
    maxHeight: 40,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginTop: 16,
  },
  roundKey: {
    width: 34,
    height: 34,
  },
  rowKey: {
    marginHorizontal: 4,
    paddingHorizontal: 8,
  },

  touchpadContainer: {
    width: '100%',
    minHeight: 360,
    height: '50%',
    marginTop: 16,
    marginBottom: 2,
    justifyContent: 'space-between',
    flexDirection: 'row',
  },
  touchpad: {
    width: '94%',
    height: '100%',
    borderRadius: 8,
    backgroundColor: colors.TOUCHPAD,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollWheelContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    width: '6%',
    height: '100%',
  },
  scrollWheelTrack: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 1,
    backgroundColor: colors.WHITE,
    height: '100%',
    left: 4,
  },
  scrollWheelThumb: {
    width: 20,
    height: 60,
    backgroundColor: colors.WHITE,
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  thumbLine: {
    width: 12,
    height: 2,
    backgroundColor: colors.PRIM_BG,
    marginVertical: 2,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  button: {
    width: '100%',
    backgroundColor: 'blue',
  },
  retryWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    color: colors.WHITE,
    textAlign: 'center',
    fontSize: 16,
    fontFamily: 'Raleway-Regular',
  },
  txtRetry: {
    color: colors.PRIM_BG,
    marginTop: 16,
    backgroundColor: colors.PRIM_ACCENT,
    borderRadius: 4,
    padding: 8,
    fontFamily: 'Raleway-Regular',
  },
  input: {
    height: 40,
    width: '100%',
    margin: 12,
    borderWidth: 1,
    padding: 10,
    // opacity: 0,
    display: 'none',
    color: colors.PRIM_BG,
    backgroundColor: 'white',
    zIndex: 100,
  },
  txtStatus: {
    color: colors.WHITE,
    marginTop: 16,
  },
});
