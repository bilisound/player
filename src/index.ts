import BilisoundPlayerModule from "./BilisoundPlayerModule";
import { TrackData, TrackDataInternal } from "./types";

export function play(): Promise<void> {
  return BilisoundPlayerModule.play();
}

export function togglePlayback(): Promise<void> {
  return BilisoundPlayerModule.togglePlayback();
}

export function addTrack(trackData: TrackData): Promise<void> {
  const builtTrackData: TrackDataInternal = {
    uri: trackData.uri,
    artworkUri: trackData.artworkUri ?? null,
    title: trackData.title ?? null,
    artist: trackData.artist ?? null,
    duration: trackData.duration ?? null,
    httpHeaders: trackData.httpHeaders
      ? JSON.stringify(trackData.httpHeaders)
      : null,
    extendedData: trackData.extendedData
      ? JSON.stringify(trackData.extendedData)
      : null,
  };
  return BilisoundPlayerModule.addTrack(JSON.stringify(builtTrackData));
}
