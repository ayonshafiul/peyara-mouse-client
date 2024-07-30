// server related constants
export const SERVER_KEY = 'servers';

export const SERVER_URL_KEY = 'SERVER_URL';

export const QRCODE_SECRET = '<peyara>';

export const MIN_DESKTOP_APP_VERSION = '0.1.1';

export const SERVER_REST_RESPONSE = 'peyara';

// settings constants

export const SETTINGS_INITIALIZED = 'settingsinitialized';

export const SETTINGS_INVERTED_SCROLL_KEY = 'invertedscroll';

export const SETTINGS_KEEP_AWAKE_KEY = 'keepawake';

export const SETTINGS_TOUCHPAD_SENSITIVITY = 'sensitivity';

export const SETTINGS_TOUCHPAD_SCROLL_SENSITIVITY = 'scrollsensitivity';

export const SETTINGS_TOUCHPAD_RESPONSE_RATE = 'responserate';

export const SETTINGS_ONBOARDING_SHOW_EVERYTIME =
  'settingsonboardingshoweverytime';

export const SETTINGS_ONBOARDING_SHOW_FIRST_TIME = 'settingsonboardingonetime';

export const settingsData = [
  {
    label: 'Inverted scroll',
    key: SETTINGS_INVERTED_SCROLL_KEY,
  },
  {
    label: 'Keep screen awake while connected',
    key: SETTINGS_KEEP_AWAKE_KEY,
  },
  {
    label: 'Always show onboarding screen',
    key: SETTINGS_ONBOARDING_SHOW_EVERYTIME,
  },
];

export const mediaKeysData = [
  {
    icon: 'volume-off',
    key: 'audio_mute',
    label: 'Mute',
  },
  {
    icon: 'volume-down',
    key: 'audio_vol_down',
    label: 'V-',
  },
  {
    icon: 'volume-up',
    key: 'audio_vol_up',
    label: 'V+',
  },
  {
    icon: 'play-arrow',
    key: 'audio_play',
    label: 'Play',
  },
  {
    icon: 'pause',
    key: 'audio_pause',
    label: 'Pause',
  },
  {
    icon: 'stop',
    key: 'audio_stop',
    label: 'Stop',
  },
  {
    icon: 'skip-previous',
    key: 'audio_prev',
    label: 'Previous',
  },
  {
    icon: 'skip-next',
    key: 'audio_next',
    label: 'Next',
  },
];

export const arrowKeysData = [
  {
    icon: 'keyboard-arrow-up',
    key: 'up',
    label: '↑',
  },
  {
    icon: 'keyboard-arrow-down',
    key: 'down',
    label: '↓',
  },
  {
    icon: 'keyboard-arrow-left',
    key: 'left',
    label: '←',
  },
  {
    icon: 'keyboard-arrow-right',
    key: 'right',
    label: '→',
  },
];

export const DEFAULT_TOUCHPAD_SENSITIVITY = 0.5;
export const DEFAULT_TOUCHPAD_SCROLL_SENSITIVITY = 0.5;
export const DEFAULT_TOUCHPAD_RESPONSE_RATE = 12;
