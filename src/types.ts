export type ExtendedData = any;

export interface TrackData {
  uri: string;
  artworkUri?: string | null;
  title?: string | null;
  artist?: string | null;
  duration?: number | null;
  httpHeaders?: Record<string, string> | null;
  extendedData?: ExtendedData | null;
}

export interface TrackDataInternal {
  uri: string;
  artworkUri: string | null;
  title: string | null;
  artist: string | null;
  duration: number | null;
  httpHeaders: string | null;
  extendedData: string | null;
}

export interface PlaybackProgress {
  duration: number;
  position: number;
  buffered: number;
}

// 播放状态类型
export type PlaybackState =
  | "STATE_IDLE"
  | "STATE_BUFFERING"
  | "STATE_READY"
  | "STATE_ENDED";

// 错误类型
export type ErrorType =
  | "ERROR_NETWORK_FAILURE"
  | "ERROR_BAD_HTTP_STATUS_CODE"
  | "ERROR_GENERIC";

// 播放状态变化事件
export interface PlaybackStateChangeEvent {
  type: PlaybackState;
}

// 播放错误事件
export interface PlaybackErrorEvent {
  type: ErrorType;
  message: string;
  code?: number;
}

export interface EventList {
  onPlaybackStateChange: PlaybackStateChangeEvent;
  onPlaybackError: PlaybackErrorEvent;
  onQueueChange: null;
}
