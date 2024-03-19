import {StyleSheet, Text, View} from 'react-native';
import React, {forwardRef, useMemo} from 'react';
import {mediaKeysData} from '../assets/constants/constants';
import RoundKey from '../components/RoundKey';
import colors from '../assets/constants/colors';
import {BottomSheetModal, BottomSheetView} from '@gorhom/bottom-sheet';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Animated from 'react-native-reanimated';

function KeyboardModal({sendMediaKey}, ref) {
  const snapPoints = useMemo(() => ['30%', '50%'], []);

  return (
    <View style={styles.container}>
      <BottomSheetModal
        ref={ref}
        index={0}
        snapPoints={snapPoints}
        handleIndicatorStyle={{backgroundColor: 'white'}}
        handleStyle={{
          backgroundColor: colors.PRIM_BG,
        }}
        style={{
          backgroundColor: colors.PRIM_BG,
        }}
        enableOverDrag={false}
        detached>
        <BottomSheetView style={styles.contentContainer}>
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
        </BottomSheetView>
      </BottomSheetModal>
    </View>
  );
}

export default forwardRef(KeyboardModal);
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    flexWrap: 'wrap',
    backgroundColor: colors.PRIM_BG,
    padding: 8,
  },
});
