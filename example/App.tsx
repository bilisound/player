import * as BilisoundPlayer from "bilisound-player";
import { useEvents } from "bilisound-player/hooks/useEvents";
import { useProgress } from "bilisound-player/hooks/useProgress";
import { Button, StyleSheet, Text, ToastAndroid, View } from "react-native";

import { getBilisoundResourceUrl, getVideoUrl } from "~/api/bilisound";

async function addBiliTrack(id: string, episode = 1) {
  const res = await getBilisoundResourceUrl({ id, episode });
  console.log(res);
  await BilisoundPlayer.addTracks([
    {
      uri: res.url,
      httpHeaders: {
        referer: getVideoUrl(id, episode),
      },
    },
  ]);
  ToastAndroid.show("添加成功：" + id + ", " + episode, 5000);
}

export default function App() {
  useEvents("onPlaybackError", (e) => {
    console.log("onPlaybackError", e);
  });

  useEvents("onPlaybackStateChange", (e) => {
    console.log("onPlaybackStateChange", e);
  });

  async function handleGetAllTracks() {
    const result = await BilisoundPlayer.getTracks();
    console.log(JSON.stringify(result, null, 4));
  }

  const progress = useProgress();

  return (
    <View style={styles.container}>
      <Text>Music Player</Text>
      <Text>{`Real time Progress: ${JSON.stringify(progress)}`}</Text>
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
        onPress={async () => {
          await addBiliTrack("BV1yJ411j7F2");
          // await BilisoundPlayer.addTrack({
          //   uri: "https://assets.tcdww.cn/website/test/01%20TIME.m4a",
          //   httpHeaders: {
          //     "User-Agent": "Mozilla/5.0"
          //   }
          // });
        }}
        title="Add another"
      />
      <Button
        onPress={async () =>
          await BilisoundPlayer.replaceTrack(1, {
            uri: "https://assets.tcdww.cn/website/test/05 パシオン.m4a",
            artworkUri: "https://assets.tcdww.cn/website/test/8%20(106).jpg",
            title: "测试标题 " + Math.random(),
          })
        }
        title="Replace index 1"
      />
      <View style={styles.row}>
        <Button onPress={() => BilisoundPlayer.play()} title="Play" />
        <Button onPress={() => BilisoundPlayer.toggle()} title="Toggle" />
        <Button onPress={() => BilisoundPlayer.seek(20)} title="seek 20 秒" />
        <Button
          onPress={async () => {
            const begin = performance.now();
            const result = await BilisoundPlayer.getProgress();
            const end = performance.now();
            console.log(result);
            console.log(end - begin + "ms");
          }}
          title="查进度"
        />
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
