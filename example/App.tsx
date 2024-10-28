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
          await BilisoundPlayer.replaceTrack(1, {
            uri: "https://assets.tcdww.cn/website/test/05 パシオン.m4a",
            title: "测试标题 " + Math.random(),
          })
        }
        title="Replace index 1"
      />
      <View style={styles.row}>
        <Button onPress={() => BilisoundPlayer.play()} title="Play" />
        <Button onPress={() => BilisoundPlayer.toggle()} title="Toggle" />
        <Button onPress={() => BilisoundPlayer.seek(20)} title="Seek to 20s" />
      </View>
      <View style={styles.row}>
        <Button onPress={() => BilisoundPlayer.setSpeed(1)} title="Speed 1" />
        <Button
          onPress={() => BilisoundPlayer.setSpeed(0.8, false)}
          title="0.8"
        />
        <Button onPress={() => BilisoundPlayer.setSpeed(0.8)} title="0.8 R" />
        <Button
          onPress={() => BilisoundPlayer.setSpeed(1.2, false)}
          title="1.2"
        />
        <Button onPress={() => BilisoundPlayer.setSpeed(1.2)} title="1.2 R" />
      </View>
      <Button
        onPress={() => BilisoundPlayer.deleteTracks([2, 1])}
        title="Delete Track index 2, 1"
      />
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
  row: {
    gap: 8,
    flexDirection: "row",
    alignItems: "center",
  },
});
