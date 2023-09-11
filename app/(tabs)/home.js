import React, { useState, useRef, useCallback, useEffect } from "react";
import {
  Text,
  View,
  StyleSheet,
  LayoutAnimation,
  TouchableOpacity,
} from "react-native";
import Animated, { useAnimatedStyle } from "react-native-reanimated";
import SwipeableItem, {
  useSwipeableItemParams,
  OpenDirection,
} from "react-native-swipeable-item";
import DraggableFlatList from "react-native-draggable-flatlist";
import colors from "../../assets/constants/colors";
import { getServers, setServers } from "../../utils/servers";
import { Link, router, useRouter } from "expo-router";
import { TouchableWithoutFeedback } from "react-native-gesture-handler";

const OVERSWIPE_DIST = 20;

export default function Home() {
  const [data, setData] = useState([]);
  const itemRefs = useRef(new Map());
  const router = useRouter();

  const renderItem = useCallback((params) => {
    const onPressDelete = () => {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.spring);
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
        let seperatedArray = s.split("<peyara>");
        let url = seperatedArray[0];
        let host = seperatedArray[1];
        return {
          key: `key-${index + 1}`,
          urlData: s,
          url,
          host,
        };
      });
      setData(servers);
    });
  }, []);

  return (
    <View style={styles.container}>
      <DraggableFlatList
        keyExtractor={(item) => item.key}
        data={data}
        renderItem={renderItem}
        onDragEnd={({ data }) => setData(data)}
        activationDistance={20}
        ListHeaderComponent={() => (
          <View style={styles.row}>
            <Link href="qrcode" asChild>
              <Text style={styles.text}>+ Add Server</Text>
            </Link>
          </View>
        )}
      />
    </View>
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
      renderUnderlayLeft={() => (
        <UnderlayLeft drag={drag} onPressDelete={onPressDelete} />
      )}
      renderUnderlayRight={() => <UnderlayRight item={item} />}
      snapPointsLeft={[100]}
      snapPointsRight={[100]}
    >
      <TouchableOpacity
        activeOpacity={1}
        onLongPress={drag}
        onPress={() => itemRefs.current.get(item.key).open("right")}
        style={[styles.row]}
      >
        <View>
          <Text style={styles.text}>{`${item.url}`}</Text>
          <Text style={styles.text}>{`${item.host}`}</Text>
        </View>
      </TouchableOpacity>
    </SwipeableItem>
  );
}

const UnderlayLeft = ({ drag, onPressDelete }) => {
  const { item, percentOpen } = useSwipeableItemParams();
  const animStyle = useAnimatedStyle(
    () => ({
      opacity: percentOpen.value,
    }),
    [percentOpen]
  );

  return (
    <Animated.View
      style={[styles.row, styles.underlayLeft, animStyle]} // Fade in on open
    >
      <TouchableOpacity onPress={onPressDelete}>
        <Text style={styles.text}>{`Delete`}</Text>
      </TouchableOpacity>
    </Animated.View>
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
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: colors.PRIM_BG,
  },
  row: {
    flexDirection: "row",
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    marginVertical: 8,
    backgroundColor: colors.PRIM_FRONT,
    borderRadius: 8,
  },
  text: {
    fontWeight: "bold",
    color: "white",
    fontSize: 16,
  },
  textDark: {
    fontWeight: "bold",
    fontSize: 16,
    color: colors.PRIM_BG,
  },
  underlayRight: {
    backgroundColor: colors.PRIM_ACCENT,
    justifyContent: "flex-start",
  },
  underlayLeft: {
    backgroundColor: colors.RED,
    justifyContent: "flex-end",
  },
});
