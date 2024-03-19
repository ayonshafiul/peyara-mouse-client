import {
  SETTINGS_INITIALIZED,
  SETTINGS_INVERTED_SCROLL_KEY,
  SETTINGS_KEEP_AWAKE_KEY,
  SETTINGS_ONBOARDING_SHOW_EVERYTIME,
  SETTINGS_ONBOARDING_SHOW_FIRST_TIME,
} from '../assets/constants/constants';
import {setBooleanValueFor, getBooleanValueFor} from './secure-store';

export async function initializeDefaultSettings() {
  let invertedScrollSettings = getInvertedScrollSettings();
  if (invertedScrollSettings == undefined) {
    setBooleanValueFor(SETTINGS_INVERTED_SCROLL_KEY, false);
  }
  let keepAwakeSettings = getKeepAwakeSettings();
  if (keepAwakeSettings == undefined) {
    setBooleanValueFor(SETTINGS_KEEP_AWAKE_KEY, true);
  }
  let onboardingEveryTimeSettings = getShowOnBoardingSettingsEverytime();
  if (onboardingEveryTimeSettings == undefined) {
    setBooleanValueFor(SETTINGS_ONBOARDING_SHOW_EVERYTIME, false);
  }
  let onboardingFirstTimeSettings = getShowOnBoardingSettingsFirstTime();
  if (onboardingFirstTimeSettings == undefined) {
    setBooleanValueFor(SETTINGS_ONBOARDING_SHOW_FIRST_TIME, true);
  }
}

export async function getInvertedScrollSettings() {
  return getBooleanValueFor(SETTINGS_INVERTED_SCROLL_KEY);
}

export async function getKeepAwakeSettings() {
  return getBooleanValueFor(SETTINGS_KEEP_AWAKE_KEY);
}

export async function getShowOnBoardingSettingsEverytime() {
  return getBooleanValueFor(SETTINGS_ONBOARDING_SHOW_EVERYTIME);
}

export async function getShowOnBoardingSettingsFirstTime() {
  return getBooleanValueFor(SETTINGS_ONBOARDING_SHOW_FIRST_TIME);
}
