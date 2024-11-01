import { addListener } from "../events";
import { getIsPlaying } from "../index";
import { createSubscriptionStore } from "../utils";

export const useIsPlaying = createSubscriptionStore({
  eventName: "onIsPlayingChange",
  fetchData: getIsPlaying,
  addListener,
  initialValue: false,
});
