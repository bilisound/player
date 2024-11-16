import { registerWebModule, NativeModule } from "expo";

import {
  DownloadState,
  EventListFunc,
  PlaybackProgress,
  PlaybackState,
  TrackData,
  TrackDataInternal,
} from "./types";
import { BilisoundPlayerModuleInterface } from "./types/module";

class BilisoundPlayerModuleWeb
  extends NativeModule<EventListFunc>
  implements BilisoundPlayerModuleInterface
{
  private static isMediaSessionAvailable = !!window?.navigator?.mediaSession;
  /**
   * HTMLAudioElement 本体
   */
  private audioElement: HTMLAudioElement;
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
  /**
   * 播放速度设置
   * @private
   */
  private playbackSpeedOption = {
    speed: 1,
    retainPitch: true,
  };
  private playbackState: PlaybackState = "STATE_IDLE";

  constructor() {
    super();
    const el = document.createElement("audio");
    el.dataset.managedByBilisound = this.id;
    el.addEventListener("loadstart", () => {
      this.playbackState = "STATE_BUFFERING";
      this.emit("onPlaybackStateChange", {
        type: "STATE_BUFFERING",
      });
    });
    el.addEventListener("canplay", () => {
      this.playbackState = "STATE_READY";
      this.emit("onPlaybackStateChange", {
        type: "STATE_READY",
      });
    });
    el.addEventListener("ended", () => {
      if (this.index >= this.trackData.length - 1) {
        // 没有可以继续播放的内容了！
        this.playbackState = "STATE_ENDED";
        this.emit("onPlaybackStateChange", {
          type: "STATE_ENDED",
        });
      } else {
        // 播放下一首
        this.next();
      }
    });
    el.addEventListener("play", () => {
      this.emit("onIsPlayingChange", { isPlaying: true });
    });
    el.addEventListener("pause", () => {
      this.emit("onIsPlayingChange", { isPlaying: false });
    });
    el.addEventListener("error", (e) => {
      this.emit("onPlaybackError", {
        type: "ERROR_GENERIC",
        message: e.message,
      });
    });
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

  private emitQueueChange() {
    this.emit("onQueueChange", null);
  }

  private emitCurrentChange() {
    this.emit("onTrackChange", null);
  }

  private clear() {
    this.audioElement.pause();
    this.audioElement.src = "";
    this.index = -1;
    this.trackData = [];
  }

  async play() {
    await this.audioElement.play();
  }

  async pause() {
    this.audioElement.pause();
  }

  async prev() {
    const { audioElement } = this;
    if (!audioElement) {
      return;
    }
    // https://ux.stackexchange.com/questions/80335/why-does-previous-button-in-music-player-apps-start-the-current-track-from-the-b
    if (!audioElement.paused && audioElement.currentTime > 3) {
      audioElement.currentTime = 0;
      return;
    }
    if (this.index > 0) {
      await this.jump(this.index - 1);
    }
  }

  async next() {
    if (this.index < this.trackData.length - 1) {
      await this.jump(this.index + 1);
    }
  }

  async toggle() {
    if (this.audioElement.paused) {
      await this.play();
    } else {
      await this.pause();
    }
  }

  async seek(to: number) {
    this.audioElement.currentTime = to;
  }

  async jump(to: number) {
    const { audioElement } = this;
    if (!audioElement) {
      return;
    }
    if (to < 0 || to >= this.trackData.length) {
      throw new Error("非法的索引值");
    }
    this.index = to;
    const prevPlayState = !audioElement.paused;
    const obj = this.trackData[to];
    audioElement.src = obj.uri;

    if (prevPlayState) {
      await this.play();
    }
    this.emitCurrentChange();
  }

  async getProgress(): Promise<PlaybackProgress> {
    const { audioElement } = this;
    return {
      // 当前播放时间
      position: audioElement.currentTime || 0,
      // 音频总长度
      duration: audioElement.duration || 0,
      // 已加载长度
      buffered:
        audioElement.buffered.length > 0
          ? audioElement.buffered.end(audioElement.buffered.length - 1)
          : 0,
    };
  }

  async getPlaybackState(): Promise<PlaybackState> {
    return this.playbackState;
  }

  async getIsPlaying(): Promise<boolean> {
    return !this.audioElement.paused;
  }

  async getCurrentTrack(): Promise<TrackDataInternal | null> {
    throw new Error("Method not implemented.");
  }

  async getCurrentTrackWeb(): Promise<TrackData | null> {
    return this.trackData[this.index] ?? null;
  }

  async setSpeed(speed: number, retainPitch: boolean) {
    this.playbackSpeedOption = {
      speed,
      retainPitch,
    };
    this.audioElement.playbackRate = speed;
    this.audioElement.preservesPitch = retainPitch;
  }

  async addTrack(trackDataJson: TrackData) {
    this.trackData.push(trackDataJson);
    if (this.index < 0) {
      await this.jump(0);
    }
    this.emitQueueChange();
    this.emitCurrentChange();
  }

  async addTrackAt(trackDataJson: TrackData, index: number) {
    if (index < 0 || index > this.trackData.length - 1) {
      throw new Error("Index out of range");
    }
    this.trackData.splice(index, 1, trackDataJson);
    if (this.index >= index) {
      this.index += 1;
    }
    this.emitQueueChange();
    this.emitCurrentChange();
  }

  async addTracks(trackDatasJson: TrackData[]) {
    this.trackData.push(...trackDatasJson);
    if (this.index < 0) {
      await this.jump(0);
    }
    this.emitQueueChange();
    this.emitCurrentChange();
  }

  async addTracksAt(trackDatasJson: TrackData[], index: number) {
    if (index < 0 || index > this.trackData.length - 1) {
      throw new Error("Index out of range");
    }
    this.trackData.splice(index, 0, ...trackDatasJson);
    if (this.index >= index) {
      this.index += trackDatasJson.length;
    }
    this.emitQueueChange();
    this.emitCurrentChange();
  }

  async getTracks(): Promise<TrackData[]> {
    return this.trackData;
  }

  async replaceTrack(index: number, trackDataJson: TrackData) {
    this.emitQueueChange();
    throw new Error("Method not implemented.");
  }

  async deleteTrack(index: number) {
    this.emitQueueChange();
    throw new Error("Method not implemented.");
  }

  async deleteTracks(indexesJson: number[]) {
    this.emitQueueChange();
    throw new Error("Method not implemented.");
  }

  async addDownload(id: string, uri: string, metadataJson: string) {
    throw new Error("Method not implemented.");
  }

  async getDownload(id: string): Promise<string> {
    throw new Error("Method not implemented.");
  }

  async getDownloads(state?: DownloadState): Promise<string> {
    throw new Error("Method not implemented.");
  }

  async pauseDownload(id: string) {
    throw new Error("Method not implemented.");
  }

  async resumeDownload(id: string) {
    throw new Error("Method not implemented.");
  }

  async pauseAllDownloads() {
    throw new Error("Method not implemented.");
  }

  async resumeAllDownloads() {
    throw new Error("Method not implemented.");
  }

  async removeDownload(id: string) {
    throw new Error("Method not implemented.");
  }
}

export const BilisoundPlayerModule = registerWebModule(
  BilisoundPlayerModuleWeb,
);
