import * as BilisoundPlayer from "bilisound-player";
import { useEvents } from "bilisound-player/hooks/useEvents";
import { useIsPlaying } from "bilisound-player/hooks/useIsPlaying";
import { usePlaybackState } from "bilisound-player/hooks/usePlaybackState";
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

function RealTimeProgress() {
  const progress = useProgress();

  return <Text>{`Progress:\n${JSON.stringify(progress, null, 2)}`}</Text>;
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

  const playbackState = usePlaybackState();
  const isPlaying = useIsPlaying();

  return (
    <View style={styles.container}>
      <RealTimeProgress />
      <Text>{`Playback state: ${playbackState}`}</Text>
      <Text>{`Playing: ${isPlaying}`}</Text>
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
            await addBiliTrack("BV1b84y187WC");
          }}
          title="Add 1"
        />
        <Button
          onPress={async () => {
            await addBiliTrack("BV1Bx41187eP");
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
        <Button onPress={() => BilisoundPlayer.prev()} title="Prev" />
        <Button onPress={() => BilisoundPlayer.toggle()} title="Toggle" />
        <Button onPress={() => BilisoundPlayer.next()} title="Next" />
        <Button onPress={() => BilisoundPlayer.seek(20)} title="seek 20 秒" />
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
