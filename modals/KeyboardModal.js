import { StyleSheet, Text, View } from "react-native";
import React, { forwardRef, useMemo } from "react";
import { mediaKeysData } from "../assets/constants/constants";
import RoundKey from "../components/RoundKey";
import colors from "../assets/constants/colors";
import { BottomSheetModal, BottomSheetView } from "@gorhom/bottom-sheet";
import { MaterialIcons } from "@expo/vector-icons";

function KeyboardModal({ sendMediaKey }, ref) {
  const snapPoints = useMemo(() => ["24%", "50%"], []);

  return (
    <BottomSheetModal
      ref={ref}
      index={0}
      snapPoints={snapPoints}
      handleIndicatorStyle={{ backgroundColor: "white" }}
      handleStyle={{
        backgroundColor: colors.PRIM_BG,
      }}
    >
      <BottomSheetView style={styles.contentContainer}>
        {mediaKeysData.map((item, idx) => {
          return (
            <RoundKey key={idx} onPress={() => sendMediaKey(item.key)}>
              <MaterialIcons name={item.icon} size={24} color={colors.WHITE} />
            </RoundKey>
          );
        })}
      </BottomSheetView>
    </BottomSheetModal>
  );
}

export default forwardRef(KeyboardModal);
const styles = StyleSheet.create({
  contentContainer: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    flexWrap: "wrap",
    backgroundColor: colors.PRIM_BG,
    padding: 8,
  },
});
