import {
  FlatList,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import React, {useCallback, useRef} from 'react';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import {styles} from './Onboarding';

import FingerIcon from '../assets/svg/finger.svg';
import CursorIcon from '../assets/svg/cursor.svg';
import SingleTapIcon from '../assets/svg/single-tap.svg';
import DoubleTapIcon from '../assets/svg/double-tap.svg';
import TwoFingerScrollIcon from '../assets/svg/two-finger-scroll.svg';

import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import colors from '../assets/constants/colors';

const duration = 2000;

function Window({children, style}) {
  return (
    <Animated.View style={[styles.touchpad, style]}>
      <View style={styles.dotContainer}>
        <View style={[styles.dot, styles.dotRed]} />
        <View style={[styles.dot, styles.dotYellow]} />
        <View style={[styles.dot, styles.dotGreen]} />
      </View>
      {children}
    </Animated.View>
  );
}

function MoveCursor() {
  const tX = useSharedValue(50);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{translateX: tX.value}],
  }));

  React.useEffect(() => {
    tX.value = withRepeat(
      withTiming(-50, {
        duration,
      }),
      -1,
      true,
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <>
      <Window>
        <Animated.View style={animStyle}>
          <CursorIcon />
        </Animated.View>
      </Window>
      <View style={styles.touchpad}>
        <Animated.View style={animStyle}>
          <FingerIcon />
        </Animated.View>
      </View>
    </>
  );
}

function TapOnce() {
  return (
    <>
      <Window>
        <CursorIcon />
      </Window>
      <View style={styles.touchpad}>
        <SingleTapIcon />
      </View>
    </>
  );
}

function TapTwice() {
  return (
    <>
      <Window>
        <CursorIcon />
      </Window>
      <View style={styles.touchpad}>
        <DoubleTapIcon />
      </View>
    </>
  );
}

function TwoFingerScroll() {
  const t = useSharedValue(50);

  const moveVertically = useAnimatedStyle(() => ({
    transform: [{translateY: t.value}],
  }));

  React.useEffect(() => {
    t.value = withRepeat(
      withTiming(-50, {
        duration,
      }),
      -1,
      true,
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <>
      <Window>
        <Animated.View style={[styles.scrollbar, moveVertically]} />
        <CursorIcon />
      </Window>
      <View style={styles.touchpad}>
        <Animated.View style={moveVertically}>
          <TwoFingerScrollIcon />
        </Animated.View>
      </View>
    </>
  );
}

function TapAndMoveToWindowDrag() {
  const t = useSharedValue(50);

  const moveHorizontally = useAnimatedStyle(() => ({
    transform: [{translateX: t.value}],
  }));

  React.useEffect(() => {
    t.value = withRepeat(
      withTiming(-50, {
        duration,
      }),
      -1,
      true,
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <>
      <Window style={moveHorizontally}>
        <View style={styles.placeTop}>
          <CursorIcon />
        </View>
      </Window>
      <View style={styles.touchpad}>
        <Animated.View style={moveHorizontally}>
          <SingleTapIcon />
        </Animated.View>
      </View>
    </>
  );
}

function ShowKeyboard() {
  return <MaterialIcons name="keyboard-hide" size={48} color={colors.WHITE} />;
}

function ShowControls() {
  return <MaterialIcons name="control-camera" size={48} color={colors.WHITE} />;
}

function Orientation() {
  return (
    <MaterialIcons
      name="stay-primary-landscape"
      size={48}
      color={colors.WHITE}
    />
  );
}

const steps = [
  {
    label: 'Move the desktop cursor with your finger',
    component: <MoveCursor />,
  },

  {
    label: 'Tap once for click',
    component: <TapOnce />,
  },
  {
    label: 'Tap twice for double click',
    component: <TapTwice />,
  },

  {
    label: 'Two Finger Drag to scroll',
    component: <TwoFingerScroll />,
  },

  {
    label: 'Tap and move to drag windows around',
    component: <TapAndMoveToWindowDrag />,
  },
  {
    label: 'Press to toggle keyboard',
    component: <ShowKeyboard />,
  },
  {
    label: 'Press to show more controls',
    component: <ShowControls />,
  },
  {
    label: 'Press to change orientation of touchpad',
    component: <Orientation />,
  },
];
export default function Help({navigation}) {
  const flatListRef = useRef();

  const goToNextStep = async index => {
    if (index < steps.length) {
      flatListRef.current.scrollToIndex({
        index: index,
        animated: true,
      });
    } else {
      navigation.navigate('TouchpadScreen');
    }
  };

  const StepsCard = useCallback(({item, index}) => {
    return (
      <View style={styles.stepContainer}>
        <Text style={styles.label}>{item.label}</Text>
        {item.component}
        <TouchableOpacity
          onPress={() => goToNextStep(index + 1)}
          style={[styles.nextButton]}
          activeOpacity={0.8}>
          <Text style={styles.nextButtonText}>
            {index === steps.length - 1 ? 'Ok' : 'Next'}
          </Text>
        </TouchableOpacity>
      </View>
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <SafeAreaView style={[styles.containerSafe, stylesX.container]}>
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

const stylesX = StyleSheet.create({
  container: {
    paddingBottom: 60,
  },
});
