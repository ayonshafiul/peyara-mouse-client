// server related constants
export const SERVER_KEY = "servers";

// settings constants

export const SETTINGS_INITIALIZED = "settingsinitialized";

export const SETTINGS_INVERTED_SCROLL_KEY = "invertedscroll";

export const SETTINGS_KEEP_AWAKE_KEY = "keepawake";

export const SETTINGS_ONBOARDING_SHOW_EVERYTIME =
  "settingsonboardingshoweverytime";

export const SETTINGS_ONBOARDING_SHOW_FIRST_TIME = "settingsonboardingonetime";

export const settingsData = [
  {
    label: "Inverted scroll",
    key: SETTINGS_INVERTED_SCROLL_KEY,
  },
  {
    label: "Keep screen awake while connected",
    key: SETTINGS_KEEP_AWAKE_KEY,
  },
  {
    label: "Always show onboarding screen",
    key: SETTINGS_ONBOARDING_SHOW_EVERYTIME,
  },
];
