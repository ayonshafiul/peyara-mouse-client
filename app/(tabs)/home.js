import React, { useState, useRef, useCallback, useEffect } from "react";
import {
  Text,
  View,
  StyleSheet,
  LayoutAnimation,
  TouchableOpacity,
  Image,
  SafeAreaView,
} from "react-native";
import Animated, { useAnimatedStyle } from "react-native-reanimated";
import SwipeableItem, {
  useSwipeableItemParams,
  OpenDirection,
} from "react-native-swipeable-item";
import DraggableFlatList from "react-native-draggable-flatlist";
import colors from "../../assets/constants/colors";
import global from "../../assets/styles/global";
import { getServers, setServers } from "../../utils/servers";
import { router, useRouter } from "expo-router";

import AppIcon from "../../assets/icon.png";
import { Feather, MaterialIcons } from "@expo/vector-icons";
import { QRCODE_SECRET } from "../../assets/constants/constants";

const OVERSWIPE_DIST = 20;

export default function Home() {
  const [data, setData] = useState([]);
  const itemRefs = useRef(new Map());
  const router = useRouter();

  const renderItem = useCallback((params) => {
    const onPressDelete = () => {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.linear);
      setData((prev) => {
        let filteredData = prev.filter((item) => item.key !== params.item.key);
        setServers(
          filteredData.map((d) => {
            return d.urlData;
          })
        );
        return filteredData;
      });
    };

    return (
      <RowItem {...params} itemRefs={itemRefs} onPressDelete={onPressDelete} />
    );
  }, []);

  useEffect(() => {
    getServers().then((res) => {
      let servers = res.map((s, index) => {
        let seperatedArray = s?.split(QRCODE_SECRET);
        let url = seperatedArray[0];
        let host = seperatedArray[1];
        return {
          key: `key-${index + 1}`,
          urlData: s,
          url: url,
          host: host,
        };
      });
      setData(servers);
    });
  }, []);

  return (
    <SafeAreaView style={global.container}>
      <Image source={AppIcon} style={styles.icon} />
      <DraggableFlatList
        keyExtractor={(item) => item.key}
        data={data}
        bounces={false}
        renderItem={renderItem}
        onDragEnd={({ data }) => setData(data)}
        activationDistance={20}
        ListHeaderComponent={() => {
          return (
            <View>
              {data.length > 0 && (
                <Text style={styles.listTitleText}>Servers List</Text>
              )}
              {data.length == 0 && (
                <Text style={[styles.text, styles.helperText]}>
                  Tap the + button to scan for QRCode.
                </Text>
              )}
            </View>
          );
        }}
        containerStyle={{
          flex: 1,
          flexGrow: 1,
          paddingVertical: 16,
        }}
      />

      <TouchableOpacity
        style={styles.plusButton}
        onPress={() => {
          router.push("/qrcode");
        }}
      >
        <Text style={styles.plusButtonText}>+</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

function RowItem({ item, itemRefs, drag, onPressDelete }) {
  return (
    <SwipeableItem
      key={item.key}
      item={item}
      ref={(ref) => {
        if (ref && !itemRefs.current.get(item.key)) {
          itemRefs.current.set(item.key, ref);
        }
      }}
      onChange={({ openDirection }) => {
        if (openDirection !== OpenDirection.NONE) {
          [...itemRefs.current.entries()].forEach(([key, ref]) => {
            if (key !== item.key && ref) ref.close();
          });
        }
      }}
      overSwipe={OVERSWIPE_DIST}
      renderUnderlayLeft={() => <UnderlayLeft onPressDelete={onPressDelete} />}
      renderUnderlayRight={() => <UnderlayRight item={item} />}
      snapPointsLeft={[100]}
      snapPointsRight={[100]}
    >
      <TouchableOpacity
        activeOpacity={1}
        onPress={() => itemRefs.current.get(item.key).open("right")}
        style={[styles.row]}
      >
        <View>
          <View style={styles.rowLeft}>
            <Feather name="cpu" size={24} color={colors.WHITE} />
            <Text style={styles.text}>{`${item.host}`}</Text>
          </View>
          <View style={styles.rowLeft}>
            <Feather name="link-2" size={24} color={colors.WHITE} />
            <Text style={styles.text}>{`${item.url}`}</Text>
          </View>
        </View>
        <TouchableOpacity onPressIn={drag}>
          <MaterialIcons name="drag-handle" size={24} color={colors.WHITE} />
        </TouchableOpacity>
      </TouchableOpacity>
    </SwipeableItem>
  );
}

const UnderlayLeft = ({ onPressDelete }) => {
  return (
    <TouchableOpacity
      style={[styles.row, styles.underlayLeft]}
      onPress={onPressDelete}
    >
      {/* <TouchableOpacity onPress={onPressDelete}> */}
      <Text style={styles.textBold}>{`Delete`}</Text>
      {/* </TouchableOpacity> */}
    </TouchableOpacity>
  );
};

function UnderlayRight({ item }) {
  const { close } = useSwipeableItemParams();
  return (
    <TouchableOpacity
      style={[styles.row, styles.underlayRight]}
      onPress={() => {
        router.push({
          pathname: "/touchpad",
          params: { url: item?.url },
        });
        close();
      }}
    >
      <Text style={styles.textDark}>Connect</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    flex: 1,
    alignItems: "center",
    justifyContent: "space-between",
    padding: 8,
    marginVertical: 8,
    backgroundColor: colors.TOUCHPAD,
    borderRadius: 8,
  },
  rowLeft: {
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center",
    gap: 8,
  },
  text: {
    color: colors.WHITE,
    fontSize: 14,
    fontFamily: "Inter_400Regular",
  },
  textBold: {
    color: colors.WHITE,
    fontWeight: "bold",
    fontSize: 16,
    fontFamily: "Inter_400Regular",
  },
  listTitleText: {
    fontWeight: "bold",
    color: colors.WHITE,
    fontSize: 16,
    fontFamily: "Inter_400Regular",
    marginTop: 16,
  },
  textDark: {
    fontWeight: "bold",
    fontSize: 16,
    color: colors.PRIM_BG,
    fontFamily: "Inter_400Regular",
  },
  underlayRight: {
    backgroundColor: colors.PRIM_ACCENT,
    justifyContent: "flex-start",
  },
  underlayLeft: {
    backgroundColor: colors.RED,
    justifyContent: "flex-end",
    paddingRight: 8,
  },
  icon: {
    width: 152,
    height: 152,
    alignSelf: "center",
    marginTop: 24,
  },
  helperText: { textAlign: "center", marginTop: 200, fontSize: 18 },
  plusButton: {
    width: 64,
    height: 64,
    backgroundColor: colors.PRIM_ACCENT,
    borderRadius: 42,
    position: "absolute",
    bottom: 16,
    right: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  plusButtonText: {
    fontWeight: "bold",
    color: colors.PRIM_BG,
    fontSize: 32,
    fontFamily: "Inter_400Regular",
  },
});
