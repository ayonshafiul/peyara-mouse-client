import {
  SETTINGS_INITIALIZED,
  SETTINGS_INVERTED_SCROLL_KEY,
  SETTINGS_KEEP_AWAKE_KEY,
} from "../assets/constants/constants";
import { setBooleanValueFor, getBooleanValueFor } from "./secure-store";

export async function initializeDefaultSettings() {
  let settingsInitialized = await getBooleanValueFor(SETTINGS_INITIALIZED);
  if (!settingsInitialized) {
    await setBooleanValueFor(SETTINGS_INVERTED_SCROLL_KEY, false);
    await setBooleanValueFor(SETTINGS_KEEP_AWAKE_KEY, false);
    await setBooleanValueFor(SETTINGS_INITIALIZED, true);
  }
}

export async function getInvertedScrollSettings() {
  return await getBooleanValueFor(SETTINGS_INVERTED_SCROLL_KEY);
}

export async function getKeepAwakeSettings() {
  return await getBooleanValueFor(SETTINGS_KEEP_AWAKE_KEY);
}
