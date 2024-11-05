import { setDefaultHeaders } from "bilisound-player";
import { useState } from "react";
import { Button, ScrollView, StyleSheet, Text, View } from "react-native";

import { Control } from "~/components/Control";
import { Playlist } from "~/components/Playlist";

type Pages = "control" | "playlist";

setDefaultHeaders({
  "User-Agent":
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36",
});

export default function App() {
  const [page, setPage] = useState<Pages>("control");

  return (
    <ScrollView>
      <View style={styles.container}>
        <Text>Music Player</Text>
        <View style={styles.row}>
          <Button onPress={() => setPage("control")} title="Control" />
          <Button onPress={() => setPage("playlist")} title="Playlist" />
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
