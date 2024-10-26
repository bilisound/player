import BilisoundPlayerModule from "./BilisoundPlayerModule";
import { TrackData, TrackDataInternal } from "./types";

/**
 * 播放
 */
export function play(): Promise<void> {
  return BilisoundPlayerModule.play();
}

/**
 * 切换播放/暂停状态
 */
export function togglePlayback(): Promise<void> {
  return BilisoundPlayerModule.togglePlayback();
}

/**
 * 向播放队列添加单首曲目
 * @param trackData 曲目信息
 */
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

/**
 * 获取整个播放队列
 * @returns {Promise<TrackData[]>} 整个播放队列
 */
export async function getTracks(): Promise<TrackData[]> {
  const raw = await (BilisoundPlayerModule.getTracks() as Promise<string>);
  const rawData: TrackDataInternal[] = JSON.parse(raw);
  return rawData.map((e) => {
    return {
      ...e,
      httpHeaders: e.httpHeaders ? JSON.parse(e.httpHeaders) : undefined,
      extendedData: e.extendedData ? JSON.parse(e.extendedData) : undefined,
    } as TrackData;
  });
}
