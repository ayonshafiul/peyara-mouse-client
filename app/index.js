import { useRootNavigationState, Redirect, useRouter } from "expo-router";

import OnBoarding from "../components/OnBoarding";
import { useEffect, useState } from "react";
import {
  getShowOnBoardingSettingsEverytime,
  getShowOnBoardingSettingsFirstTime,
} from "../utils/settings";

export default function App() {
  const rootNavigationState = useRootNavigationState();
  const router = useRouter();
  const [showOnBoarding, setShowOnBoarding] = useState(false);

  useEffect(() => {
    async function getFirstTimeSettings() {
      let showOnBoardingSettingsFirstTime =
        await getShowOnBoardingSettingsFirstTime();
      let showOnBoardingSettingsEveryTime =
        await getShowOnBoardingSettingsEverytime();

      if (
        showOnBoardingSettingsEveryTime ||
        showOnBoardingSettingsFirstTime ||
        showOnBoardingSettingsFirstTime == null // handles the case when it is uninialized
      ) {
        setShowOnBoarding(true);
      } else {
        router.replace("home");
      }
    }
    getFirstTimeSettings();
  }, []);

  // wait for the root navigator to load correctly
  if (!rootNavigationState?.key) return null;

  return <>{showOnBoarding && <OnBoarding />}</>;
}
