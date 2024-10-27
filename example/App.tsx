import * as BilisoundPlayer from "bilisound-player";
import { Button, StyleSheet, Text, View } from "react-native";

export default function App() {
  async function handleGetAllTracks() {
    const result = await BilisoundPlayer.getTracks();
    console.log(JSON.stringify(result, null, 4));
  }

  return (
    <View style={styles.container}>
      <Text>Music Player</Text>
      <Button
        onPress={async () =>
          await BilisoundPlayer.addTracks([
            {
              uri: "https://assets.tcdww.cn/website/test/01 25時のラブレター.m4a",
            },
            {
              uri: "https://assets.tcdww.cn/website/test/01 逃避 行.m4a",
            },
          ])
        }
        title="Add Tracks"
      />
      <Button
        onPress={async () =>
          await BilisoundPlayer.addTrack(
            {
              uri: "https://assets.tcdww.cn/website/test/01 ユナイト.m4a",
              artworkUri: "https://assets.tcdww.cn/website/test/8%20(106).jpg",
              httpHeaders: {
                "User-Agent": "Mozilla/5.0",
              },
            },
            1,
          )
        }
        title="Add index 1"
      />
      <Button
        onPress={async () =>
          await BilisoundPlayer.replaceTrack(
            {
              uri: "https://assets.tcdww.cn/website/test/05 パシオン.m4a",
            },
            1,
          )
        }
        title="Replace index 1"
      />
      <Button onPress={() => BilisoundPlayer.play()} title="Play" />
      <Button onPress={() => BilisoundPlayer.toggle()} title="Toggle" />
      <Button onPress={handleGetAllTracks} title="Get All Tracks" />
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
