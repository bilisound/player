import { EventSubscription } from "expo-modules-core";
import { useSyncExternalStore } from "react";

import { addListener } from "./events";
import { Config } from "./player";
import { TrackData, TrackDataInternal } from "./types";

/**
 * TrackData 转 TrackDataInternal
 * @param trackData
 */
export function toTrackDataInternal(trackData: TrackData): TrackDataInternal {
  const userHeaders = trackData.headers ?? {};
  const headers = { ...Config.instance.defaultHeaders, ...userHeaders };
  return {
    id: trackData.id,
    uri: trackData.uri,
    artworkUri: trackData.artworkUri ?? null,
    title: trackData.title ?? null,
    artist: trackData.artist ?? null,
    duration: trackData.duration ?? null,
    headers: JSON.stringify(headers),
    extendedData: trackData.extendedData
      ? JSON.stringify(trackData.extendedData)
      : null,
  };
}

/**
 * TrackDataInternal 转 TrackData
 * @param trackDataInternal
 */
export function toTrackData(trackDataInternal: TrackDataInternal): TrackData {
  return {
    ...trackDataInternal,
    headers: trackDataInternal.headers
      ? JSON.parse(trackDataInternal.headers)
      : undefined,
    extendedData: trackDataInternal.extendedData
      ? JSON.parse(trackDataInternal.extendedData)
      : undefined,
  };
}

interface CreateSubscriptionStoreConfig<T> {
  eventName: string | string[];
  fetchData: () => Promise<T>;
  addListener: typeof addListener;
  initialValue: T;
  interval?: number;
  isEqualMethod?: (a: T, b: T) => boolean;
}

/**
 * 快速创建面向播放器事件的 React Hook
 * @param eventName
 * @param fetchData
 * @param addListener
 * @param initialValue
 * @param interval 自动刷新间隔，不指定则不会自动刷新
 * @param isEqualMethod 对象的比较方式，可以用于避免 React 非必要渲染。如果不指定，则只要对象引用变化就触发渲染
 */
export function createSubscriptionStore<T>({
  eventName,
  fetchData,
  addListener,
  initialValue,
  interval,
  isEqualMethod,
}: CreateSubscriptionStoreConfig<T>) {
  const progressListeners: Set<() => void> = new Set();
  let currentValue: T = initialValue;
  let eventSubscriptions: EventSubscription[] = [];
  let timer: ReturnType<typeof setTimeout> | null = null;

  const doFetch = async () => {
    const prevValue = currentValue;
    currentValue = await fetchData();
    // 如果指定 compareMethod 而且比较发现是一致的，则不触发更新
    if (isEqualMethod && isEqualMethod(prevValue, currentValue)) {
      return;
    }
    progressListeners.forEach((listener) => listener());
  };

  const startFetching = () => {
    const eventNames = Array.isArray(eventName) ? eventName : [eventName];
    eventSubscriptions = eventNames.map((name) => addListener(name, doFetch));
    doFetch();
    if (typeof interval === "number" && timer === null) {
      timer = setInterval(doFetch, interval);
    }
  };

  const stopFetching = () => {
    eventSubscriptions.forEach((subscription) => subscription?.remove());
    eventSubscriptions = [];
    if (timer !== null) {
      clearInterval(timer);
      timer = null;
    }
  };

  const subscribe = (listener: () => void) => {
    progressListeners.add(listener);
    if (eventSubscriptions.length <= 0) {
      startFetching();
    }
    return () => {
      progressListeners.delete(listener);
      if (progressListeners.size <= 0) {
        stopFetching();
      }
    };
  };

  const getSnapshot = () => {
    return currentValue;
  };

  return () => useSyncExternalStore(subscribe, getSnapshot);
}

export function deleteItems<T>(arr: T[], items: number[]) {
  // 首先将 items 进行排序（降序），然后从 items 中 index 最大的一项开始就地删除数组中的内容
  for (const index of items.toSorted((a, b) => b - a)) {
    arr.splice(index, 1);
  }
  return arr;
}
