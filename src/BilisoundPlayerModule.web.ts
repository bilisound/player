import { registerWebModule, NativeModule } from "expo";

import {
  DownloadState,
  EventList,
  PlaybackProgress,
  PlaybackState,
  TrackData,
  TrackDataInternal,
} from "./types";
import { BilisoundPlayerModuleInterface } from "./types/module";

class BilisoundPlayerModuleWeb
  extends NativeModule<EventList>
  implements BilisoundPlayerModuleInterface
{
  private static isMediaSessionAvailable = !!window?.navigator?.mediaSession;
  /**
   * HTMLAudioElement 本体
   */
  private audioElement?: HTMLAudioElement;
  /**
   * 播放队列
   */
  private trackData: TrackData[] = [];
  /**
   * 实例 ID
   */
  private readonly id = window.crypto.randomUUID();
  /**
   * 当前播放内容在队列中的位置
   */
  private index = -1;
  /**
   * 播放进度
   */
  private audioProgress: PlaybackProgress = {
    duration: 0,
    buffered: 0,
    position: 0,
  };

  constructor() {
    super();
    const el = document.createElement("audio");
    el.dataset.managedByBilisound = this.id;
    if (BilisoundPlayerModuleWeb.isMediaSessionAvailable) {
      navigator.mediaSession.setActionHandler("previoustrack", () =>
        this.prevTrack(),
      );
      navigator.mediaSession.setActionHandler("nexttrack", () =>
        this.nextTrack(),
      );
    }

    // 挂载元素
    document.body.appendChild(el);
    this.audioElement = el;
  }

  play(): Promise<void> {
    throw new Error("Method not implemented.");
  }
  pause(): Promise<void> {
    throw new Error("Method not implemented.");
  }
  prev(): Promise<void> {
    throw new Error("Method not implemented.");
  }
  next(): Promise<void> {
    throw new Error("Method not implemented.");
  }
  toggle(): Promise<void> {
    throw new Error("Method not implemented.");
  }
  seek(to: number): Promise<void> {
    throw new Error("Method not implemented.");
  }
  jump(to: number): Promise<void> {
    throw new Error("Method not implemented.");
  }
  getProgress(): Promise<PlaybackProgress> {
    throw new Error("Method not implemented.");
  }
  getPlaybackState(): Promise<PlaybackState> {
    throw new Error("Method not implemented.");
  }
  getIsPlaying(): Promise<boolean> {
    throw new Error("Method not implemented.");
  }
  getCurrentTrack(): Promise<TrackDataInternal | null> {
    throw new Error("Method not implemented.");
  }
  setSpeed(speed: number, retainPitch: boolean): Promise<void> {
    throw new Error("Method not implemented.");
  }

  async addTrack(trackDataJson: TrackData): Promise<void> {
    this.trackData.push(trackDataJson);
    if (this.index < 0) {
      this.index = 0;
    }
  }
  async addTrackAt(trackDataJson: TrackData, index: number): Promise<void> {
    if (index < 0 || index > this.trackData.length - 1) {
      throw new Error("Index out of range");
    }
    this.trackData[index] = trackDataJson;
  }
  async addTracks(trackDatasJson: TrackData[]): Promise<void> {
    this.trackData.push(...trackDatasJson);
    if (this.index < 0) {
      this.index = 0;
    }
  }
  async addTracksAt(trackDatasJson: TrackData[], index: number): Promise<void> {
    if (index < 0 || index > this.trackData.length - 1) {
      throw new Error("Index out of range");
    }
    this.trackData.splice(index, 0, ...trackDatasJson);
  }
  async getTracks(): Promise<TrackData[]> {
    return this.trackData;
  }
  async replaceTrack(index: number, trackDataJson: TrackData): Promise<void> {
    throw new Error("Method not implemented.");
  }
  async deleteTrack(index: number): Promise<void> {
    throw new Error("Method not implemented.");
  }
  async deleteTracks(indexesJson: number[]): Promise<void> {
    throw new Error("Method not implemented.");
  }

  addDownload(id: string, uri: string, metadataJson: string): Promise<void> {
    throw new Error("Method not implemented.");
  }
  getDownload(id: string): Promise<string> {
    throw new Error("Method not implemented.");
  }
  getDownloads(state?: DownloadState): Promise<string> {
    throw new Error("Method not implemented.");
  }
  pauseDownload(id: string): Promise<void> {
    throw new Error("Method not implemented.");
  }
  resumeDownload(id: string): Promise<void> {
    throw new Error("Method not implemented.");
  }
  pauseAllDownloads(): Promise<void> {
    throw new Error("Method not implemented.");
  }
  resumeAllDownloads(): Promise<void> {
    throw new Error("Method not implemented.");
  }
  removeDownload(id: string): Promise<void> {
    throw new Error("Method not implemented.");
  }
}

export const BilisoundPlayerModule = registerWebModule(
  BilisoundPlayerModuleWeb,
);
