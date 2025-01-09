import { EventSubscription } from "expo-modules-core";
import { AppRegistry, Platform } from "react-native";

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
  if (Platform.OS === "android") {
    AppRegistry.registerHeadlessTask(BACKGROUND_EVENT_TASK_NAME, () => {
      return async (data: any) => {
        await handler(data);
      };
    });
    return;
  }

  BilisoundPlayerModule.removeAllListeners("onPlaybackStateChange");
  BilisoundPlayerModule.removeAllListeners("onPlaybackError");
  BilisoundPlayerModule.removeAllListeners("onQueueChange");
  BilisoundPlayerModule.removeAllListeners("onTrackChange");
  BilisoundPlayerModule.removeAllListeners("onIsPlayingChange");
  BilisoundPlayerModule.removeAllListeners("onPlayingProgressChange");
  BilisoundPlayerModule.removeAllListeners("onDownloadUpdate");

  addListener("onPlaybackStateChange", (data) =>
    handler({
      event: "onPlaybackStateChange",
      data,
    }),
  );
  addListener("onPlaybackError", (data) =>
    handler({
      event: "onPlaybackError",
      data,
    }),
  );
  addListener("onQueueChange", (data) =>
    handler({
      event: "onQueueChange",
      data,
    }),
  );
  addListener("onTrackChange", (data) =>
    handler({
      event: "onTrackChange",
      data,
    }),
  );
  addListener("onIsPlayingChange", (data) =>
    handler({
      event: "onIsPlayingChange",
      data,
    }),
  );
  addListener("onPlayingProgressChange", (data) =>
    handler({
      event: "onPlayingProgressChange",
      data,
    }),
  );
  addListener("onDownloadUpdate", (data) =>
    handler({
      event: "onDownloadUpdate",
      data,
    }),
  );
}
