import { registerWebModule, NativeModule } from "expo";

import {
  DownloadState,
  EventList,
  PlaybackProgress,
  PlaybackState,
  TrackDataInternal,
} from "./types";
import { BilisoundPlayerModuleInterface } from "./types/module";

class BilisoundPlayerModuleWeb
  extends NativeModule<EventList>
  implements BilisoundPlayerModuleInterface
{
  constructor() {
    super();

    console.log("BilisoundPlayerModuleWeb init!");
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
  addTrack(trackDataJson: string): Promise<void> {
    throw new Error("Method not implemented.");
  }
  addTrackAt(trackDataJson: string, index: number): Promise<void> {
    throw new Error("Method not implemented.");
  }
  addTracks(trackDatasJson: string): Promise<void> {
    throw new Error("Method not implemented.");
  }
  addTracksAt(trackDatasJson: string, index: number): Promise<void> {
    throw new Error("Method not implemented.");
  }
  getTracks(): Promise<string> {
    throw new Error("Method not implemented.");
  }
  replaceTrack(index: number, trackDataJson: string): Promise<void> {
    throw new Error("Method not implemented.");
  }
  deleteTrack(index: number): Promise<void> {
    throw new Error("Method not implemented.");
  }
  deleteTracks(indexesJson: string): Promise<void> {
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

const result = registerWebModule(BilisoundPlayerModuleWeb);

console.log("result: ", result);

export default result;
