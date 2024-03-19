import React, {useEffect, useState} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import RootNavigator from './navigation/RootNavigator';
import {BottomSheetModalProvider} from '@gorhom/bottom-sheet';
import {
  getShowOnBoardingSettingsEverytime,
  getShowOnBoardingSettingsFirstTime,
} from './utils/settings';
import SplashScreen from 'react-native-splash-screen';
import {ActivityIndicator} from 'react-native';
import colors from './assets/constants/colors';

export default function App() {
  const [initialRoute, setInitialRoute] = useState('');

  useEffect(() => {
    async function getFirstTimeSettings() {
      let showOnBoardingSettingsFirstTime =
        getShowOnBoardingSettingsFirstTime();
      let showOnBoardingSettingsEveryTime =
        getShowOnBoardingSettingsEverytime();
      if (
        showOnBoardingSettingsEveryTime ||
        showOnBoardingSettingsFirstTime ||
        showOnBoardingSettingsFirstTime === undefined // handles the case when it is uninialized
      ) {
        setInitialRoute('Onboarding');
      } else {
        setInitialRoute('Tabs');
      }
      SplashScreen.hide();
    }
    getFirstTimeSettings();
  }, []);

  return (
    <GestureHandlerRootView style={{flex: 1}}>
      <NavigationContainer>
        <BottomSheetModalProvider>
          {!initialRoute && (
            <ActivityIndicator size={'large'} color={colors.PRIM_ACCENT} />
          )}
          {initialRoute && <RootNavigator initialRoute={initialRoute} />}
        </BottomSheetModalProvider>
      </NavigationContainer>
    </GestureHandlerRootView>
  );
}
