import { addListener } from "../events";
import { getCurrentTrack } from "../index";
import { createSubscriptionStore } from "../utils";

export const useCurrentTrack = createSubscriptionStore({
  eventName: "onTrackChange",
  fetchData: getCurrentTrack,
  addListener,
  initialValue: undefined,
});
