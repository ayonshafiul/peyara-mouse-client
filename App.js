import React, {useEffect, useState} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import RootNavigator from './navigation/RootNavigator';
import {BottomSheetModalProvider} from '@gorhom/bottom-sheet';
import {
  getShowOnBoardingSettingsEverytime,
  getShowOnBoardingSettingsFirstTime,
  initializeDefaultSettings,
} from './utils/settings';
import SplashScreen from 'react-native-splash-screen';
import {ActivityIndicator, Platform} from 'react-native';
import colors from './assets/constants/colors';

import SpInAppUpdates, {
  NeedsUpdateResponse,
  IAUUpdateKind,
  StartUpdateOptions,
} from 'sp-react-native-in-app-updates';

initializeDefaultSettings();

const inAppUpdates = new SpInAppUpdates(
  false, // isDebug
);

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

      inAppUpdates
        .checkNeedsUpdate()
        .then(result => {
          if (result.shouldUpdate) {
            let updateOptions = {};
            if (Platform.OS === 'android') {
              updateOptions = {
                updateType: IAUUpdateKind.FLEXIBLE,
              };
            }
            inAppUpdates.startUpdate(updateOptions);
          }
        })
        .catch(err => {
          console.log('🚀 ~ inAppUpdates.checkNeedsUpdate ~ err:', err);
        });
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
