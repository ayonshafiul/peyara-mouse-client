import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import React, {forwardRef, useMemo} from 'react';
import {mediaKeysData} from '../assets/constants/constants';
import RoundKey from '../components/RoundKey';
import colors from '../assets/constants/colors';
import {
  BottomSheetModal,
  BottomSheetScrollView,
  BottomSheetView,
} from '@gorhom/bottom-sheet';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Animated from 'react-native-reanimated';

function KeyboardModal({sendMediaKey, sendLeftClick, sendRightClick}, ref) {
  const snapPoints = useMemo(() => ['33%', '50%'], []);

  return (
    <View style={styles.container}>
      <BottomSheetModal
        ref={ref}
        index={1}
        snapPoints={snapPoints}
        handleStyle={{
          backgroundColor: colors.PRIM_BG,
        }}
        handleIndicatorStyle={{
          backgroundColor: colors.WHITE,
        }}
        style={{
          backgroundColor: colors.PRIM_BG,
        }}
        enableOverDrag={false}
        detached>
        <View style={styles.clicksWrapper}>
          <TouchableOpacity style={styles.clickBtn} onPress={sendLeftClick}>
            <Text style={styles.clickBtnText}>Left Click</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.clickBtn} onPress={sendRightClick}>
            <Text style={styles.clickBtnText}>Right Click</Text>
          </TouchableOpacity>
        </View>
        <BottomSheetScrollView style={styles.scrollContainer}>
          <View style={styles.contentContainer}>
            {mediaKeysData.map((item, idx) => {
              return (
                <RoundKey key={idx} onPress={() => sendMediaKey(item.key)}>
                  <MaterialIcons
                    name={item.icon}
                    size={24}
                    color={colors.WHITE}
                  />
                </RoundKey>
              );
            })}
          </View>
        </BottomSheetScrollView>
      </BottomSheetModal>
    </View>
  );
}

export default forwardRef(KeyboardModal);
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    backgroundColor: colors.PRIM_BG,
  },
  contentContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    flexWrap: 'wrap',
    padding: 8,
    borderWidth: 0,
    borderColor: 'transparent',
  },

  clicksWrapper: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 16,
    backgroundColor: colors.PRIM_BG,
  },
  clickBtn: {
    width: '49.6%',
    height: 60,
    borderRadius: 4,
    backgroundColor: colors.TOUCHPAD,
    justifyContent: 'center',
    alignItems: 'center',
  },
  clickBtnText: {
    fontFamily: 'Raleway-Thin',
  },
});
