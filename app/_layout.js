import { Slot } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { StatusBar } from "expo-status-bar";
import { useFonts, Inter_400Regular } from "@expo-google-fonts/inter";
import * as SplashScreen from "expo-splash-screen";
import { useCallback } from "react";
import { initializeDefaultSettings } from "../utils/settings";
SplashScreen.preventAutoHideAsync();
export default function RootLayout() {
  let [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
  });

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded || fontError) {
      await initializeDefaultSettings();
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);
  if (!fontsLoaded && !fontError) {
    return null;
  }
  return (
    <GestureHandlerRootView
      style={{ flex: 1 }}
      onLayoutRootView={onLayoutRootView}
    >
      <SafeAreaView style={{ flex: 1 }}>
        <Slot />
      </SafeAreaView>
      <StatusBar style="light" backgroundColor="#1f1f1f" />
    </GestureHandlerRootView>
  );
}
