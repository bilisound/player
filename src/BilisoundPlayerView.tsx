import { requireNativeViewManager } from 'expo-modules-core';
import * as React from 'react';

import { BilisoundPlayerViewProps } from './BilisoundPlayer.types';

const NativeView: React.ComponentType<BilisoundPlayerViewProps> =
  requireNativeViewManager('BilisoundPlayer');

export default function BilisoundPlayerView(props: BilisoundPlayerViewProps) {
  return <NativeView {...props} />;
}
