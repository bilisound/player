import * as BilisoundPlayer from "bilisound-player";
import { useEvents } from "bilisound-player/hooks/useEvents";
import { useProgress } from "bilisound-player/hooks/useProgress";
import { Button, StyleSheet, Text, ToastAndroid, View } from "react-native";

import {
  getBilisoundMetadata,
  getBilisoundResourceUrl,
  getVideoUrl,
} from "~/api/bilisound";

async function addBiliTrack(id: string, episode = 1) {
  const info = await getBilisoundMetadata({ id });
  const res = await getBilisoundResourceUrl({ id, episode });
  console.log(res);
  await BilisoundPlayer.addTracks([
    {
      uri: res.url,
      title: info.data.title,
      artist: info.data.owner.name,
      artworkUri: info.data.pic,
      duration: info.data.pages[episode - 1].duration,
      httpHeaders: {
        referer: getVideoUrl(id, episode),
      },
    },
  ]);
  ToastAndroid.show("添加成功：" + id + ", " + episode, 5000);
}

export function Control() {
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
      <View style={styles.row}>
        <Button
          onPress={async () => {
            await addBiliTrack("BV1yJ411j7F2");
          }}
          title="Add 1"
        />
        <Button
          onPress={async () => {
            await addBiliTrack("BV1yJ411j7F2", 2);
          }}
          title="Add 2"
        />
        <Button
          onPress={async () => {
            await addBiliTrack("BV1kw411t7iy");
          }}
          title="Add 3"
        />
        <Button
          onPress={async () => {
            await addBiliTrack("BV1NH4y1c723");
          }}
          title="Add 4"
        />
      </View>
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
        <Button
          onPress={() => BilisoundPlayer.setSpeed(50 / 60, false)}
          title="50 / 60"
        />
        <Button
          onPress={() => BilisoundPlayer.setSpeed(0.9, false)}
          title="0.9"
        />
        <Button onPress={() => BilisoundPlayer.setSpeed(1)} title="1" />
        <Button
          onPress={() => BilisoundPlayer.setSpeed(1.1, false)}
          title="1.1"
        />
        <Button
          onPress={() => BilisoundPlayer.setSpeed(1.2, false)}
          title="1.2"
        />
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
    justifyContent: "flex-start",
    gap: 8,
  },
  row: {
    gap: 8,
    flexDirection: "row",
    alignItems: "center",
  },
});