import { addListener } from "../events";
import { getTracks } from "../index";
import { createSubscriptionStore } from "../utils";

export const useQueue = createSubscriptionStore({
  eventName: "onQueueChange",
  fetchData: getTracks,
  addListener,
  initialValue: [],
});
