import { EventEmitter, requireNativeModule } from "expo-modules-core";

// It loads the native module object from the JSI or falls back to
// the bridge module (from NativeModulesProxy) if the remote debugger is on.
export const BilisoundPlayerModule = requireNativeModule("BilisoundPlayer");

export const bilisoundPlayerEmitter = new EventEmitter(BilisoundPlayerModule);
