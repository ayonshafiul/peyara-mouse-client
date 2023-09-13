import {
  SETTINGS_INITIALIZED,
  SETTINGS_INVERTED_SCROLL_KEY,
  SETTINGS_KEEP_AWAKE_KEY,
} from "../assets/constants/constants";
import { setValueFor, getValueFor } from "./servers";

export async function initializeDefaultSettings() {
  let settingsInitialized = await getValueFor(SETTINGS_INITIALIZED);
  if (!settingsInitialized) {
    await setValueFor(SETTINGS_INVERTED_SCROLL_KEY, false);
    await setValueFor(SETTINGS_KEEP_AWAKE_KEY, false);
    await setValueFor(SETTINGS_INITIALIZED, true);
  }
}
