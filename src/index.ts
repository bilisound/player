import { NativeModulesProxy, EventEmitter, Subscription } from 'expo-modules-core';

// Import the native module. On web, it will be resolved to BilisoundPlayer.web.ts
// and on native platforms to BilisoundPlayer.ts
import BilisoundPlayerModule from './BilisoundPlayerModule';
import BilisoundPlayerView from './BilisoundPlayerView';
import { ChangeEventPayload, BilisoundPlayerViewProps } from './BilisoundPlayer.types';

// Get the native constant value.
export const PI = BilisoundPlayerModule.PI;

export function hello(): string {
  return BilisoundPlayerModule.hello();
}

export async function setValueAsync(value: string) {
  return await BilisoundPlayerModule.setValueAsync(value);
}

const emitter = new EventEmitter(BilisoundPlayerModule ?? NativeModulesProxy.BilisoundPlayer);

export function addChangeListener(listener: (event: ChangeEventPayload) => void): Subscription {
  return emitter.addListener<ChangeEventPayload>('onChange', listener);
}

export { BilisoundPlayerView, BilisoundPlayerViewProps, ChangeEventPayload };
