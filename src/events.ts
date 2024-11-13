import { Subscription } from "expo-modules-core";
import { AppRegistry } from "react-native";

import { bilisoundPlayerEmitter } from "./BilisoundPlayerModule";
import {
  BackgroundEventListener,
  BackgroundEventParam,
  BackgroundEventParamUnconfirmed,
  EventList,
} from "./types";

/**
 * 添加播放器事件监听器的具体实现
 */
export function addListener<T extends keyof EventList>(
  name: T,
  listener: (event: EventList[T]) => void,
): Subscription {
  return bilisoundPlayerEmitter.addListener(name, listener);
}

export function registerBackgroundEventListener(
  handler: BackgroundEventListener,
) {
  AppRegistry.registerHeadlessTask("BilisoundPlayerTask", () => {
    return async (data: any) => {
      const handling: BackgroundEventParamUnconfirmed = data;
      switch (handling.event) {
        case "onTrackChange": {
          const track = handling.data.track;
          track.headers = track.headers ? JSON.parse(track.headers) : undefined;
          track.extendedData = track.extendedData
            ? JSON.parse(track.extendedData)
            : undefined;
          break;
        }
        default: {
          break;
        }
      }
      await handler(handling as any);
    };
  });
}
