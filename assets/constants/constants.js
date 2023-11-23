// server related constants
export const SERVER_KEY = "servers";

export const QRCODE_SECRET = "<peyara>";

export const SERVER_REST_RESPONSE = "peyara";

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

export const mediaKeysData = [
  {
    icon: "volume-off",
    key: "audio_mute",
    label: "Mute the volume",
  },
  {
    icon: "volume-down",
    key: "audio_vol_down",
    label: "Lower the volume",
  },
  {
    icon: "volume-up",
    key: "audio_vol_up",
    label: "Increase the volume",
  },
  {
    icon: "play-arrow",
    key: "audio_play",
    label: "Play",
  },
  {
    icon: "pause",
    key: "audio_pause",
    label: "Pause",
  },
  {
    icon: "stop",
    key: "audio_stop",
    label: "Stop",
  },
  {
    icon: "skip-previous",
    key: "audio_prev",
    label: "Previous Track",
  },
  {
    icon: "skip-next",
    key: "audio_next",
    label: "Next Track",
  },
];
