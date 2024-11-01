import { useState } from "react";
import { Button, StyleSheet, Text, View } from "react-native";

import { Control } from "~/components/Control";
import { Playlist } from "~/components/Playlist";

type Pages = "control" | "playlist";

export default function App() {
  const [page, setPage] = useState<Pages>("control");

  return (
    <View style={styles.container}>
      <Text>Music Player</Text>
      <View style={styles.row}>
        <Button onPress={() => setPage("control")} title="Control" />
        <Button onPress={() => setPage("playlist")} title="Playlist" />
      </View>
      {page === "control" && <Control />}
      {page === "playlist" && <Playlist />}
    </View>
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
