import { BilisoundPlayerModule } from "./BilisoundPlayerModule";
import {
  PlaybackProgress,
  PlaybackState,
  TrackData,
  TrackDataInternal,
} from "./types";
import { toTrackDataInternal } from "./utils";

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
 * 上一首
 */
export function prev(): Promise<void> {
  return BilisoundPlayerModule.prev();
}

/**
 * 下一首
 */
export function next(): Promise<void> {
  return BilisoundPlayerModule.next();
}

/**
 * 切换播放/暂停状态
 */
export function toggle(): Promise<void> {
  return BilisoundPlayerModule.toggle();
}

/**
 * 调整播放进度
 * @param to 播放进度（秒）
 */
export function seek(to: number): Promise<void> {
  return BilisoundPlayerModule.seek(to);
}

/**
 * 跳转到队列中指定的曲目
 * @param to
 */
export function jump(to: number): Promise<void> {
  return BilisoundPlayerModule.jump(to);
}

/**
 * 获取播放进度
 */
export async function getProgress(): Promise<PlaybackProgress> {
  return JSON.parse(await BilisoundPlayerModule.getProgress());
}

/**
 * 获取播放状态
 */
export async function getPlaybackState(): Promise<PlaybackState> {
  return BilisoundPlayerModule.getPlaybackState();
}

/**
 * 获取是否正在播放
 */
export async function getIsPlaying(): Promise<boolean> {
  return BilisoundPlayerModule.getIsPlaying();
}

/**
 * 调整播放速度
 * @param speed 播放速度
 * @param retainPitch 保持音高与正常速度时一致
 */
export function setSpeed(speed: number, retainPitch = true): Promise<void> {
  return BilisoundPlayerModule.setSpeed(speed, retainPitch);
}

/**
 * 向播放队列添加单首曲目
 * @param trackData 曲目信息
 * @param index 插入位置。不指定则插入到末尾
 */
export function addTrack(trackData: TrackData, index?: number): Promise<void> {
  const builtTrackData = toTrackDataInternal(trackData);
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
  for (let i = 0; i < trackDatas.length; i++) {
    const trackData = trackDatas[i];
    processedData.push(toTrackDataInternal(trackData));
  }
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

/**
 * 替换曲目。如果替换的曲目是当前正在播放的，会导致当前播放的曲目重新开始播放
 * @param trackData 待替换曲目
 * @param index 被替换的曲目的 index
 */
export async function replaceTrack(
  index: number,
  trackData: TrackData,
): Promise<void> {
  const builtTrackData = toTrackDataInternal(trackData);
  return BilisoundPlayerModule.replaceTrack(
    index,
    JSON.stringify(builtTrackData),
  );
}

/**
 * 删除曲目
 * @param index
 */
export async function deleteTracks(index: number | number[]): Promise<void> {
  if (Array.isArray(index)) {
    return BilisoundPlayerModule.deleteTracks(JSON.stringify(index));
  }
  return BilisoundPlayerModule.deleteTrack(index);
}
