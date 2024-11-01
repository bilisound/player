import { Subscription } from "expo-modules-core";
import { useSyncExternalStore } from "react";

import { addListener } from "../events";
import { getTracks } from "../index";
import { TrackData } from "../types";

const progressListeners: Set<() => void> = new Set();

let queue: TrackData[] = [];
let subscription: Subscription | undefined = undefined;

const fetchQueue = async () => {
  queue = await getTracks();
  progressListeners.forEach((listener) => listener());
};

const startFetchingQueue = () => {
  subscription = addListener("onQueueChange", fetchQueue);
  fetchQueue();
};

const stopFetchingQueue = () => {
  subscription?.remove();
  subscription = undefined;
};

const subscribe = (listener: () => void) => {
  progressListeners.add(listener);
  startFetchingQueue();
  return () => {
    progressListeners.delete(listener);
    if (progressListeners.size <= 0) {
      stopFetchingQueue();
    }
  };
};

const getSnapshot = () => {
  return queue;
};

export function useQueue() {
  return useSyncExternalStore(subscribe, getSnapshot);
}
