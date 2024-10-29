import { Subscription } from "expo-modules-core";

import { bilisoundPlayerEmitter } from "./BilisoundPlayerModule";
import { EventList } from "./types";

/**
 * 添加播放器事件监听器的具体实现
 */
export function addListener<T extends keyof EventList>(
  name: T,
  listener: (event: EventList[T]) => void,
): Subscription {
  return bilisoundPlayerEmitter.addListener(name, listener);
}
