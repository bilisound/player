import { EventEmitter } from "expo-modules-core";

import {
  DownloadState,
  EventList,
  PlaybackProgress,
  PlaybackState,
  TrackDataInternal,
} from "../types";

export declare class BilisoundPlayerModuleInterface extends EventEmitter<EventList> {
  // 播放器相关
  play(): Promise<void>;
  pause(): Promise<void>;
  prev(): Promise<void>;
  next(): Promise<void>;
  toggle(): Promise<void>;
  seek(to: number): Promise<void>;
  jump(to: number): Promise<void>;
  getProgress(): Promise<PlaybackProgress>;
  getPlaybackState(): Promise<PlaybackState>;
  getIsPlaying(): Promise<boolean>;
  getCurrentTrack(): Promise<TrackDataInternal | null>;
  setSpeed(speed: number, retainPitch: boolean): Promise<void>;

  // 播放队列相关
  addTrack(trackDataJson: string): Promise<void>;
  addTrackAt(trackDataJson: string, index: number): Promise<void>;
  addTracks(trackDatasJson: string): Promise<void>;
  addTracksAt(trackDatasJson: string, index: number): Promise<void>;
  getTracks(): Promise<string>;
  replaceTrack(index: number, trackDataJson: string): Promise<void>;
  deleteTrack(index: number): Promise<void>;
  deleteTracks(indexesJson: string): Promise<void>;

  // 缓存管理相关
  addDownload(id: string, uri: string, metadataJson: string): Promise<void>;
  getDownload(id: string): Promise<string>;
  getDownloads(state?: DownloadState): Promise<string>;
  pauseDownload(id: string): Promise<void>;
  resumeDownload(id: string): Promise<void>;
  pauseAllDownloads(): Promise<void>;
  resumeAllDownloads(): Promise<void>;
  removeDownload(id: string): Promise<void>;
}
