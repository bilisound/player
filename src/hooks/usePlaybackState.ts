import { Subscription } from "expo-modules-core";
import { useSyncExternalStore } from "react";

import { addListener } from "../events";
import { getPlaybackState } from "../index";
import { PlaybackState } from "../types";

const progressListeners: Set<() => void> = new Set();

let playbackState: PlaybackState = "STATE_IDLE";
let subscription: Subscription | undefined = undefined;

const fetchPlaybackState = async () => {
  playbackState = await getPlaybackState();
  progressListeners.forEach((listener) => listener());
};

const startFetchingPlaybackState = () => {
  subscription = addListener("onPlaybackStateChange", fetchPlaybackState);
  fetchPlaybackState();
};

const stopFetchingPlaybackState = () => {
  subscription?.remove();
  subscription = undefined;
};

const subscribe = (listener: () => void) => {
  progressListeners.add(listener);
  startFetchingPlaybackState();
  return () => {
    progressListeners.delete(listener);
    if (progressListeners.size <= 0) {
      stopFetchingPlaybackState();
    }
  };
};

const getSnapshot = () => {
  return playbackState;
};

export function usePlaybackState() {
  return useSyncExternalStore(subscribe, getSnapshot);
}
