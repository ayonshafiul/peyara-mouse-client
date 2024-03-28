import {useCallback, useEffect, useRef, useState} from 'react';
// import {activateKeepAwakeAsync, deactivateKeepAwake} from 'expo-keep-awake';
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
} from 'react-native';
import {Gesture, GestureDetector} from 'react-native-gesture-handler';
import Animated, {runOnJS, useSharedValue} from 'react-native-reanimated';
import colors from '../assets/constants/colors';
import {io} from 'socket.io-client';
import {
  getInvertedScrollSettings,
  getKeepAwakeSettings,
} from '../utils/settings';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {
  SERVER_URL_KEY,
  SETTINGS_KEEP_AWAKE_KEY,
  SETTINGS_TOUCHPAD_SCROLL_SENSITIVITY,
  SETTINGS_TOUCHPAD_SENSITIVITY,
  mediaKeysData,
} from '../assets/constants/constants';
import useInterval from '../hooks/useInterval';
// import * as Notifications from 'expo-notifications';
import {getValueFor, setValueFor} from '../utils/storage';
import Background from '../components/Background';
import KeyboardModal from '../modals/KeyboardModal';
import RoundKey from '../components/RoundKey';
import {useFocusEffect} from '@react-navigation/native';
import notifee, {
  AndroidColor,
  AndroidFlags,
  AuthorizationStatus,
  EventType,
} from '@notifee/react-native';

let socket = null;
let textInputValueProps = Platform.os == 'ios' ? {value: ''} : {};

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

export default function Touchpad({navigation}) {
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [settingsData, setSettingsData] = useState({});

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

  // click state
  const clickStateFinger = useRef('');
  const clickStateIsDoubleTap = useRef(false);

  const lastTapped = useSharedValue(0);
  const lastTappedInRef = useRef(0);
  const isDragging = useSharedValue(false);
  const isDraggingRef = useRef(false);
  const pendingLeftClick = useRef(false);

  useEffect(() => {
    // const subscription = Notifications.addNotificationResponseReceivedListener(
    //   ({actionIdentifier}) => {
    //     switch (actionIdentifier) {
    //       case 'vup':
    //         socket?.emit('media-key', 'audio_vol_up');
    //         break;
    //       case 'vdown':
    //         socket?.emit('media-key', 'audio_vol_down');
    //         break;
    //       case 'play':
    //         socket?.emit('media-key', 'audio_play');
    //         break;
    //       default:
    //         console.log(`Unhandled action identifier: ${actionIdentifier}`);
    //     }
    //   },
    // );
    // return () => subscription.remove();
    (async function requestUserPermission() {
      const settings = await notifee.requestPermission();

      if (settings.authorizationStatus >= AuthorizationStatus.AUTHORIZED) {
        console.log('Permission settings:', settings);
      } else {
        console.log('User declined permissions');
      }
    })();

    return notifee.onForegroundEvent(eventHandler);
  }, []);

  useFocusEffect(
    useCallback(() => {
      (async function setSensitivities() {
        if (navigation.isFocused) {
          tS.current = Number(getValueFor(SETTINGS_TOUCHPAD_SENSITIVITY) ?? 1);
          sS.current = Number(
            getValueFor(SETTINGS_TOUCHPAD_SCROLL_SENSITIVITY) ?? 0.2,
          );
          const invertedScroll = getInvertedScrollSettings();
          const keepAwake = getKeepAwakeSettings();
          if (keepAwake) {
            // activateKeepAwakeAsync(SETTINGS_KEEP_AWAKE_KEY);
          } else if (keepAwake == false) {
            // do not do anything if it is null
            // deactivateKeepAwake(SETTINGS_KEEP_AWAKE_KEY);
          }
          setSettingsData({
            invertedScroll: invertedScroll,
          });
        }
      })();
      keyboardModalRef?.current?.present();
    }, []),
  );

  // socket connection handler
  const connectSocket = async () => {
    const serverUrl = getValueFor(SERVER_URL_KEY);
    // disconnect existing connections
    disconnectSocket();
    if (serverUrl) {
      socket = io.connect(serverUrl, {
        transports: ['websocket'],
      });
      socket.on('connect', () => {
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
      });

      socket.on('connect_error', error => {
        console.log(error);
        setStatus('Error');
        socket.disconnect();
        setLoading(false);
      });

      socket.on('disconnect', () => {
        setStatus('Disconnected');
        setLoading(false);
      });
    } else {
      setLoading(false);
      setStatus('Disconnected');
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
  const setPendingLeftClick = value => {
    pendingLeftClick.current = value;
  };

  useInterval(() => {
    if (pendingLeftClick.current) {
      if (Date.now() - lastTappedInRef.current > 130) {
        // console.log('Sending click');
        socket?.emit('clicks', {
          finger: 'left',
          doubleTap: false,
        });
        pendingLeftClick.current = false;
      }
    }

    if (isDraggingRef.current) {
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
  }, 32);

  const setScroll = coordinates => {
    sX.current = coordinates.x;
    sY.current = coordinates.y;
  };
  const sendClicks = state => {
    socket?.emit('clicks', state);
  };

  const sendWindowDragStart = coordinates => {
    isDraggingRef.current = true;
    socket?.emit('windowdragstart', coordinates);
  };
  const sendWindowDragUpdate = coordinates => {
    socket?.emit('windowdragupdate', coordinates);
  };
  const sendWindowDragEnd = coordinates => {
    isDraggingRef.current = false;
    socket?.emit('windowdragend', coordinates);
  };
  const sendKey = key => {
    socket?.emit('key', key);
  };
  const sendMediaKey = key => {
    socket?.emit('media-key', key);
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
        isDragging.value = true;
        runOnJS(sendWindowDragStart)();
      }
    })
    .onUpdate(e => {
      let coordinates = {
        x: e.translationX,
        y: e.translationY,
      };
      // if (isDragging.value) {
      // runOnJS(sendWindowDragUpdate)(coordinates);
      // } else {
      runOnJS(setCoordinates)(coordinates);
      // }
    })
    .onEnd(() => {
      // coord = {
      //   x: 0,
      //   y: 0,
      // };
      if (isDragging.value) {
        runOnJS(sendWindowDragEnd)();
        isDragging.value = false;
        isDraggingRef.current = false;
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
    .maxDuration(100)
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
      console.log('Double Tap');
      let state = {
        finger: 'left',
        doubleTap: true,
      };
      runOnJS(setFingerState)(state);
    });

  const composed =
    Platform.OS == 'ios'
      ? Gesture.Race(
          Gesture.Race(dragGesture, dragGestureScroll),
          Gesture.Exclusive(oneFingerDoubleTap, oneFingerTap),
        )
      : Gesture.Race(
          dragGestureScroll,
          dragGesture,
          Gesture.Exclusive(oneFingerDoubleTap, oneFingerTap),
        );
  const textInputRef = useRef();
  const timeoutRef = useRef();
  const keyboardModalRef = useRef();

  const handleKeyPress = event => {
    let key = event.nativeEvent.key;
    sendKey(key);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(clearInput, 500);
  };

  const clearInput = () => {
    if (Platform.OS != 'ios') {
      textInputRef.current?.clear();
    }
  };
  const focusToggle = () => {
    if (textInputRef.current?.isFocused()) {
      textInputRef.current?.blur();
    } else {
      textInputRef.current?.focus();
      keyboardModalRef?.current?.dismiss();
    }
  };
  const showControls = () => {
    if (textInputRef.current?.isFocused()) {
      textInputRef.current?.blur();
    }
    keyboardModalRef?.current?.present();
  };
  const renderItem = ({item}) => {
    return (
      <TouchableOpacity
        style={styles.rowKey}
        onPress={() => sendMediaKey(item.key)}>
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

        {status == 'Disconnected' && (
          <Text style={styles.text}>
            Go to home, select a server and connect again.
            <TouchableOpacity onPress={connectSocket}>
              <Text style={styles.txtRetry}>{'\n'} Reconnect</Text>
            </TouchableOpacity>
          </Text>
        )}

        {status == 'Connected' && (
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
            </View>
            <TextInput
              ref={textInputRef}
              onKeyPress={handleKeyPress}
              style={styles.input}
              multiline
              autoCapitalize="none"
              autoComplete={'off'}
              autoCorrect={false}
              spellCheck={false}
              {...textInputValueProps}
            />

            <GestureDetector gesture={composed}>
              <Animated.View style={styles.touchpad}></Animated.View>
            </GestureDetector>
            <View style={styles.clicksWrapper}>
              <TouchableOpacity style={styles.clickBtn} onPress={sendLeftClick}>
                <Text style={styles.clickBtnText}>Left Click</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.clickBtn}
                onPress={sendRightClick}>
                <Text style={styles.clickBtnText}>Right Click</Text>
              </TouchableOpacity>
            </View>
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
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  keysConatiner: {
    flex: 1,
    flexDirection: 'row',
    width: '100%',
    maxHeight: 40,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
    paddingHorizontal: 16,
    marginTop: 16,
  },
  rowKey: {
    marginHorizontal: 4,
    paddingHorizontal: 8,
  },
  touchpad: {
    width: '100%',
    minHeight: 400,
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 8,
    backgroundColor: colors.TOUCHPAD,
    justifyContent: 'center',
    alignItems: 'center',
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
  text: {
    color: colors.WHITE,
    marginTop: 8,
    textAlign: 'center',
    fontSize: 16,
  },
  txtRetry: {
    color: colors.PRIM_ACCENT,
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
  },
  txtStatus: {
    color: colors.WHITE,
    marginTop: 16,
  },
  clicksWrapper: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  clickBtn: {
    width: '48%',
    height: 60,
    borderRadius: 4,
    backgroundColor: colors.CLICK_BTN,
    justifyContent: 'center',
    alignItems: 'center',
  },
  clickBtnText: {
    fontFamily: 'Raleway-Thin',
  },
});
