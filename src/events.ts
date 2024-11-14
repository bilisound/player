import { EventSubscription } from "expo-modules-core";
import { AppRegistry } from "react-native";

import { BilisoundPlayerModule } from "./BilisoundPlayerModule";
import {
  BackgroundEventListener,
  BackgroundEventParamUnconfirmed,
  EventList,
} from "./types";

/**
 * 添加播放器事件监听器的具体实现
 */
export function addListener<T extends keyof EventList>(
  name: T,
  listener: (event: EventList[T]) => void,
): EventSubscription {
  return BilisoundPlayerModule.addListener(name, listener);
}

const BACKGROUND_EVENT_TASK_NAME = "BilisoundPlayerTask";

export function registerBackgroundEventListener(
  handler: BackgroundEventListener,
) {
  AppRegistry.registerHeadlessTask(BACKGROUND_EVENT_TASK_NAME, () => {
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
