import BilisoundPlayerModule from "./BilisoundPlayerModule";
import { TrackData, TrackDataInternal } from "./types";

/**
 * 播放
 */
export function play(): Promise<void> {
  return BilisoundPlayerModule.play();
}

/**
 * 暂停
 */
export function pause(): Promise<void> {
  return BilisoundPlayerModule.pause();
}

/**
 * 切换播放/暂停状态
 */
export function toggle(): Promise<void> {
  return BilisoundPlayerModule.toggle();
}

/**
 * 向播放队列添加单首曲目
 * @param trackData 曲目信息
 * @param index 插入位置。不指定则插入到末尾
 */
export function addTrack(trackData: TrackData, index?: number): Promise<void> {
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
  if (typeof index === "number") {
    return BilisoundPlayerModule.addTrackAt(
      JSON.stringify(builtTrackData),
      index,
    );
  }
  return BilisoundPlayerModule.addTrack(JSON.stringify(builtTrackData));
}

/**
 * 向播放队列添加多首曲目
 * @param trackDatas 曲目信息
 * @param index 插入位置。不指定则插入到末尾
 */
export function addTracks(
  trackDatas: TrackData[],
  index?: number,
): Promise<void> {
  const processedData: TrackDataInternal[] = [];
  trackDatas.forEach((trackData) => {
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
    processedData.push(builtTrackData);
  });
  if (typeof index === "number") {
    return BilisoundPlayerModule.addTracksAt(
      JSON.stringify(processedData),
      index,
    );
  }
  return BilisoundPlayerModule.addTracks(JSON.stringify(processedData));
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
