import * as React from 'react';

import { BilisoundPlayerViewProps } from './BilisoundPlayer.types';

export default function BilisoundPlayerView(props: BilisoundPlayerViewProps) {
  return (
    <div>
      <span>{props.name}</span>
    </div>
  );
}
