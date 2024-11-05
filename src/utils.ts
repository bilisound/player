import { Subscription } from "expo-modules-core";
import { useSyncExternalStore } from "react";

import { addListener } from "./events";
import { Config } from "./index";
import { EventList, TrackData, TrackDataInternal } from "./types";

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
  eventName: keyof EventList;
  fetchData: () => Promise<T>;
  addListener: typeof addListener;
  initialValue: T;
}

/**
 * 快速创建面向播放器事件的 React Hook
 * @param eventName
 * @param fetchData
 * @param addListener
 * @param initialValue
 */
export function createSubscriptionStore<T>({
  eventName,
  fetchData,
  addListener,
  initialValue,
}: CreateSubscriptionStoreConfig<T>) {
  const progressListeners: Set<() => void> = new Set();
  let currentValue: T = initialValue;
  let subscription: Subscription | undefined = undefined;

  const doFetch = async () => {
    currentValue = await fetchData();
    progressListeners.forEach((listener) => listener());
  };

  const startFetching = () => {
    subscription = addListener(eventName, doFetch);
    doFetch();
  };

  const stopFetching = () => {
    subscription?.remove();
    subscription = undefined;
  };

  const subscribe = (listener: () => void) => {
    progressListeners.add(listener);
    if (!subscription) {
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
