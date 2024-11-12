import { registerTaskAsync, setDefaultHeaders } from "bilisound-player";
import * as TaskManager from "expo-task-manager";
import { useState } from "react";
import { Button, ScrollView, StyleSheet, Text, View } from "react-native";

import { Control } from "~/components/Control";
import { Downloads } from "~/components/Downloads";
import { Playlist } from "~/components/Playlist";

type Pages = "control" | "playlist" | "downloads";

console.log("副作用激活！！");

setDefaultHeaders({
  "User-Agent":
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36",
});

TaskManager.defineTask("background_task", ({ data, error }) => {
  console.log(data, error);
});

TaskManager.defineTask("background_task2", ({ data, error }) => {
  console.log(data, error);
});

registerTaskAsync("background_task");
registerTaskAsync("background_task2");

/*let loaded = false;
AppState.addEventListener("change", (e) => {
  console.log(`状态变化：${e}`);
  if (e === "active" && !loaded) {
    loaded = true;
    console.log("任务已挂载");
    addListener("onPlaybackError", (e) => {
      console.log("onPlaybackError", e);
    });

    addListener("onTrackChange", (e) => {
      console.log("onTrackChange", e);
    });
  }
});*/

export default function App() {
  const [page, setPage] = useState<Pages>("control");

  return (
    <ScrollView>
      <View style={styles.container}>
        <Text>Music Player</Text>
        <View style={styles.row}>
          <Button onPress={() => setPage("control")} title="Control" />
          <Button onPress={() => setPage("playlist")} title="Playlist" />
          <Button onPress={() => setPage("downloads")} title="Downloads" />
        </View>
        {page === "control" && <Control />}
        {page === "playlist" && <Playlist />}
        {page === "downloads" && <Downloads />}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    justifyContent: "flex-start",
    padding: 16,
    gap: 8,
  },
  row: {
    gap: 8,
    flexDirection: "row",
    alignItems: "center",
  },
});
