import { addListener } from "../events";
import { getTracks } from "../index";
import { TrackData } from "../types";
import { createSubscriptionStore } from "../utils";

export const useQueue = createSubscriptionStore<TrackData[]>({
  eventName: "onQueueChange",
  fetchData: getTracks,
  addListener,
  initialValue: [],
});
