import { TrackData, TrackDataInternal } from "./types";

export function toTrackDataInternal(trackData: TrackData): TrackDataInternal {
  return {
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
}
