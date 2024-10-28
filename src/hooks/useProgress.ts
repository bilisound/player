import { useSyncExternalStore } from "react";

import { getProgress } from "../index";
import { PlaybackProgress } from "../types";

const progressListeners: Set<() => void> = new Set();
let previousProgress: PlaybackProgress = {
  duration: 0,
  position: 0,
  buffered: 0,
};
let currentProgress: PlaybackProgress = {
  duration: 0,
  position: 0,
  buffered: 0,
};
let intervalId: any | null = null;

const startFetchingProgress = () => {
  if (intervalId) return; // 防止重复启动

  intervalId = setInterval(async () => {
    previousProgress = currentProgress;
    const result = await getProgress();
    if (
      previousProgress.duration !== result.duration ||
      previousProgress.position !== result.position ||
      previousProgress.buffered !== result.buffered
    ) {
      currentProgress = result;
      progressListeners.forEach((listener) => listener());
    }
  }, 100);
};

const stopFetchingProgress = () => {
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
  }
};

const subscribe = (listener: () => void) => {
  progressListeners.add(listener);
  startFetchingProgress();
  return () => {
    progressListeners.delete(listener);
    if (progressListeners.size <= 0) {
      stopFetchingProgress();
    }
  };
};

const getSnapshot = (): PlaybackProgress => {
  return currentProgress;
};

/**
 * 获取当前播放进度、总时长和已加载时长
 */
export const useProgress = () => {
  return useSyncExternalStore(subscribe, getSnapshot);
};
