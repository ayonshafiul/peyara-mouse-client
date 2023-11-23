import {
  SETTINGS_INITIALIZED,
  SETTINGS_INVERTED_SCROLL_KEY,
  SETTINGS_KEEP_AWAKE_KEY,
  SETTINGS_ONBOARDING_SHOW_EVERYTIME,
  SETTINGS_ONBOARDING_SHOW_FIRST_TIME,
} from "../assets/constants/constants";
import { setBooleanValueFor, getBooleanValueFor } from "./secure-store";

export async function initializeDefaultSettings() {
  let invertedScrollSettings = await getInvertedScrollSettings();
  if (invertedScrollSettings == null)
    await setBooleanValueFor(SETTINGS_INVERTED_SCROLL_KEY, false);
  let keepAwakeSettings = await getKeepAwakeSettings();
  if (keepAwakeSettings == null)
    await setBooleanValueFor(SETTINGS_KEEP_AWAKE_KEY, true);
  let onboardingEveryTimeSettings = await getShowOnBoardingSettingsEverytime();
  if (onboardingEveryTimeSettings == null)
    await setBooleanValueFor(SETTINGS_ONBOARDING_SHOW_EVERYTIME, false);
  let onboardingFirstTimeSettings = await getShowOnBoardingSettingsFirstTime();
  if (onboardingFirstTimeSettings == null)
    await setBooleanValueFor(SETTINGS_ONBOARDING_SHOW_FIRST_TIME, true);
}

export async function getInvertedScrollSettings() {
  return await getBooleanValueFor(SETTINGS_INVERTED_SCROLL_KEY);
}

export async function getKeepAwakeSettings() {
  return await getBooleanValueFor(SETTINGS_KEEP_AWAKE_KEY);
}

export async function getShowOnBoardingSettingsEverytime() {
  return await getBooleanValueFor(SETTINGS_ONBOARDING_SHOW_EVERYTIME);
}

export async function getShowOnBoardingSettingsFirstTime() {
  return await getBooleanValueFor(SETTINGS_ONBOARDING_SHOW_FIRST_TIME);
}
