import { Subscription } from "expo-modules-core";

import { bilisoundPlayerEmitter } from "./BilisoundPlayerModule";

// 播放状态类型
type PlaybackState =
  | "STATE_IDLE"
  | "STATE_BUFFERING"
  | "STATE_READY"
  | "STATE_ENDED";

// 错误类型
type ErrorType =
  | "ERROR_NETWORK_FAILURE"
  | "ERROR_BAD_HTTP_STATUS_CODE"
  | "ERROR_GENERIC";

// 播放状态变化事件
interface PlaybackStateChangeEvent {
  type: PlaybackState;
}

// 播放错误事件
interface PlaybackErrorEvent {
  type: ErrorType;
  message: string;
  code?: number;
}

interface EventList {
  onPlaybackStateChange: PlaybackStateChangeEvent;
  onPlaybackError: PlaybackErrorEvent;
}

/**
 * 添加播放器事件监听器的具体实现
 */
export function addListener<T extends keyof EventList>(
  name: T,
  listener: (event: EventList[T]) => void,
): Subscription {
  return bilisoundPlayerEmitter.addListener(name, listener);
}
