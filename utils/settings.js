import {
  SETTINGS_INITIALIZED,
  SETTINGS_INVERTED_SCROLL_KEY,
  SETTINGS_KEEP_AWAKE_KEY,
  SETTINGS_ONBOARDING_SHOW_EVERYTIME,
  SETTINGS_ONBOARDING_SHOW_FIRST_TIME,
} from '../assets/constants/constants';
import {setBooleanValueFor, getBooleanValueFor} from './storage';

export function initializeDefaultSettings() {
  let invertedScrollSettings = getInvertedScrollSettings();
  if (typeof invertedScrollSettings !== 'boolean') {
    setBooleanValueFor(SETTINGS_INVERTED_SCROLL_KEY, false);
  }
  let keepAwakeSettings = getKeepAwakeSettings();
  if (typeof keepAwakeSettings !== 'boolean') {
    setBooleanValueFor(SETTINGS_KEEP_AWAKE_KEY, true);
  }
  let onboardingEveryTimeSettings = getShowOnBoardingSettingsEverytime();
  if (typeof onboardingEveryTimeSettings !== 'boolean') {
    setBooleanValueFor(SETTINGS_ONBOARDING_SHOW_EVERYTIME, false);
  }
  let onboardingFirstTimeSettings = getShowOnBoardingSettingsFirstTime();
  if (typeof onboardingFirstTimeSettings !== 'boolean') {
    setBooleanValueFor(SETTINGS_ONBOARDING_SHOW_FIRST_TIME, true);
  }
}

export function getInvertedScrollSettings() {
  return getBooleanValueFor(SETTINGS_INVERTED_SCROLL_KEY);
}

export function getKeepAwakeSettings() {
  return getBooleanValueFor(SETTINGS_KEEP_AWAKE_KEY);
}

export function getShowOnBoardingSettingsEverytime() {
  return getBooleanValueFor(SETTINGS_ONBOARDING_SHOW_EVERYTIME);
}

export function getShowOnBoardingSettingsFirstTime() {
  return getBooleanValueFor(SETTINGS_ONBOARDING_SHOW_FIRST_TIME);
}
