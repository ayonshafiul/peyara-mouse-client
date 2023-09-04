import { Link } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { io } from "socket.io-client";
const socket = io.connect("http://192.168.0.101:1313");
export default function App() {
  const sendMessage = () => {
    socket.emit("coordinates", { hello: "world" });
  };
  return (
    <View style={styles.container}>
      <Text>Index</Text>
      <Link href={"/qrcode"}>Go To QrCode</Link>
      <Pressable onPress={sendMessage}>
        <Text>Send</Text>
      </Pressable>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});
