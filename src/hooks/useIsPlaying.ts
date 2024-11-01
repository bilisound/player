import { Subscription } from "expo-modules-core";
import { useSyncExternalStore } from "react";

import { addListener } from "../events";
import { getIsPlaying } from "../index";
import { IsPlayingChangeEvent } from "../types";

const progressListeners: Set<() => void> = new Set();

let isPlaying = false;
let subscription: Subscription | undefined = undefined;

const fetchIsPlaying = async (args?: IsPlayingChangeEvent) => {
  isPlaying = args ? args.isPlaying : await getIsPlaying();
  progressListeners.forEach((listener) => listener());
};

const startFetchingIsPlaying = () => {
  subscription = addListener("onIsPlayingChange", fetchIsPlaying);
  fetchIsPlaying();
};

const stopFetchingIsPlaying = () => {
  subscription?.remove();
  subscription = undefined;
};

const subscribe = (listener: () => void) => {
  progressListeners.add(listener);
  startFetchingIsPlaying();
  return () => {
    progressListeners.delete(listener);
    if (progressListeners.size <= 0) {
      stopFetchingIsPlaying();
    }
  };
};

const getSnapshot = () => {
  return isPlaying;
};

export function useIsPlaying() {
  return useSyncExternalStore(subscribe, getSnapshot);
}
