import { addDownload, testAction1 } from "bilisound-player";
import { useState } from "react";
import { Button, ScrollView, StyleSheet, Text, View } from "react-native";

import { Control } from "~/components/Control";
import { Playlist } from "~/components/Playlist";

type Pages = "control" | "playlist";

export default function App() {
  const [page, setPage] = useState<Pages>("control");

  return (
    <ScrollView>
      <View style={styles.container}>
        <Text>Music Player</Text>
        <View style={styles.row}>
          <Button onPress={() => setPage("control")} title="Control" />
          <Button onPress={() => setPage("playlist")} title="Playlist" />
          <Button
            title="测试操作"
            onPress={() =>
              addDownload(
                "114514_3",
                "https://endsiy3x2cq95.x.pipedream.net/?3",
                {
                  headers: {
                    "User-Agent": "test ua change",
                    aaa: "bbbb",
                    xxx: "aaaaa",
                  },
                },
              )
            }
          />
        </View>
        {page === "control" && <Control />}
        {page === "playlist" && <Playlist />}
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
