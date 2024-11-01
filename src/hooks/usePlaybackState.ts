import { addListener } from "../events";
import { getPlaybackState } from "../index";
import { PlaybackState } from "../types";
import { createSubscriptionStore } from "../utils";

export const usePlaybackState = createSubscriptionStore<PlaybackState>({
  eventName: "onPlaybackStateChange",
  fetchData: getPlaybackState,
  addListener,
  initialValue: "STATE_IDLE",
});
