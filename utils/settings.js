import {
  SETTINGS_INITIALIZED,
  SETTINGS_INVERTED_SCROLL_KEY,
  SETTINGS_KEEP_AWAKE_KEY,
  SETTINGS_ONBOARDING_SHOW_EVERYTIME,
  SETTINGS_ONBOARDING_SHOW_FIRST_TIME,
} from "../assets/constants/constants";
import { setBooleanValueFor, getBooleanValueFor } from "./secure-store";

export async function initializeDefaultSettings() {
  let settingsInitialized = await getBooleanValueFor(SETTINGS_INITIALIZED);
  if (!settingsInitialized) {
    await setBooleanValueFor(SETTINGS_INVERTED_SCROLL_KEY, false);
    await setBooleanValueFor(SETTINGS_KEEP_AWAKE_KEY, false);
    await setBooleanValueFor(SETTINGS_INITIALIZED, true);
    await setBooleanValueFor(SETTINGS_ONBOARDING_SHOW_EVERYTIME, false);
    await setBooleanValueFor(SETTINGS_ONBOARDING_SHOW_FIRST_TIME, true);
  }
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
