import { addListener } from "../events";
import { getDownloads } from "../index";
import { createSubscriptionStore } from "../utils";

export const useDownloadTasks = createSubscriptionStore({
  eventName: "onDownloadUpdate",
  fetchData: () => getDownloads(),
  addListener,
  initialValue: [],
  interval: 1000,
});
