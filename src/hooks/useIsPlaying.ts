import { addListener } from "../events";
import { getIsPlaying } from "../index";
import { createSubscriptionStore } from "../utils";

export const useIsPlaying = createSubscriptionStore<boolean>({
  eventName: "onIsPlayingChange",
  fetchData: getIsPlaying,
  addListener,
  initialValue: false,
});
