import * as BilisoundPlayer from "bilisound-player";
import { TrackData } from "bilisound-player/types";
import { Button, StyleSheet, Text, View } from "react-native";

export default function App() {
  function handleAddTrack(trackData: TrackData) {
    BilisoundPlayer.addTrack(trackData);
  }

  return (
    <View style={styles.container}>
      <Text>Music Player</Text>
      <Button
        onPress={() =>
          handleAddTrack({
            uri: "https://assets.tcdww.cn/website/test/01 25時のラブレター.m4a",
          })
        }
        title="Add Track 1"
      />
      <Button
        onPress={() =>
          handleAddTrack({
            uri: "https://assets.tcdww.cn/website/test/01 ユナイト.m4a",
            artworkUri: "https://assets.tcdww.cn/website/test/8%20(106).jpg",
            httpHeaders: {
              "User-Agent": "Mozilla/5.0",
            },
          })
        }
        title="Add Track 2"
      />
      <Button
        onPress={() =>
          handleAddTrack({
            uri: "https://assets.tcdww.cn/website/test/01 逃避 行.m4a",
          })
        }
        title="Add Track 3"
      />
      <Button onPress={() => BilisoundPlayer.play()} title="Play" />
      <Button onPress={() => BilisoundPlayer.togglePlayback()} title="Toggle" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
});
