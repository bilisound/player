import * as BilisoundPlayer from "bilisound-player";
import { useCurrentTrack } from "bilisound-player/hooks/useCurrentTrack";
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

const HOST = "192.168.247.95";

async function addBiliTrack(id: string, episode = 1) {
  const info = await getBilisoundMetadata({ id });
  const res = await getBilisoundResourceUrl({ id, episode });
  console.log(res);
  await BilisoundPlayer.addTracks([
    {
      id: `bs_${id}_${episode}`,
      uri: res.url,
      title: info.data.title,
      artist: info.data.owner.name,
      artworkUri: info.data.pic,
      duration: info.data.pages[episode - 1].duration,
      headers: {
        referer: getVideoUrl(id, episode),
      },
    },
  ]);
  ToastAndroid.show("添加成功：" + id + ", " + episode, 5000);
}

async function downloadBiliTrack(id: string, episode = 1) {
  const res = await getBilisoundResourceUrl({ id, episode });
  console.log(res);
  await BilisoundPlayer.addDownload(`bs_${id}_${episode}`, res.url, {
    headers: {
      referer: getVideoUrl(id, episode),
    },
  });
  ToastAndroid.show("下载添加成功：" + id + ", " + episode, 5000);
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
  const currentTrack = useCurrentTrack();

  return (
    <View style={styles.container}>
      <RealTimeProgress />
      <Text>{`Playback State: ${playbackState}`}</Text>
      <Text>{`Playing: ${isPlaying}`}</Text>
      <Text>{`Current Track: ${JSON.stringify(currentTrack, null, 2)}`}</Text>
      <Button
        onPress={async () =>
          console.log(
            JSON.stringify(await BilisoundPlayer.getCurrentTrack(), null, 2),
          )
        }
        title="Console Log Current Track"
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
            await addBiliTrack("BV1bb4se5ENA");
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
        <Button
          onPress={async () => {
            await addBiliTrack("BV19U411U7rb");
          }}
          title="Add 5"
        />
      </View>
      <View style={styles.row}>
        <Button
          onPress={async () => {
            await BilisoundPlayer.addTrack({
              id: "test_track_5",
              uri: `http://${HOST}:8080/%E5%AE%89%E4%BA%95%E6%B4%8B%E4%BB%8B/%E3%81%BE%E3%82%82%E3%82%8B%E3%82%AF%E3%83%B3%E3%81%AF%E5%91%AA%E3%82%8F%E3%82%8C%E3%81%A6%E3%81%97%E3%81%BE%E3%81%A3%E3%81%9F%EF%BC%81%E3%82%A2%E3%83%AC%E3%83%B3%E3%82%B7%E3%82%99%E3%83%88%E3%83%A9%E3%83%83%E3%82%AF%E3%82%B9/05%20YO-KAI%20Disco%20(%E5%86%A5%E7%95%8C%E5%85%A5%E5%8F%A3%E3%83%AF%E3%83%BC%E3%83%AB%E3%83%89).m4a`,
              headers: {
                "User-Agent": "zehuoge",
              },
            });
          }}
          title="Add 5"
        />
        <Button
          onPress={async () => {
            await BilisoundPlayer.addTrack({
              id: "test_track_6",
              uri: `http://${HOST}:8080/%E5%AE%89%E4%BA%95%E6%B4%8B%E4%BB%8B/%E3%81%BE%E3%82%82%E3%82%8B%E3%82%AF%E3%83%B3%E3%81%AF%E5%91%AA%E3%82%8F%E3%82%8C%E3%81%A6%E3%81%97%E3%81%BE%E3%81%A3%E3%81%9F%EF%BC%81%E3%82%A2%E3%83%AC%E3%83%B3%E3%82%B7%E3%82%99%E3%83%88%E3%83%A9%E3%83%83%E3%82%AF%E3%82%B9/06%20Blossom%20Shower%20(%E6%A1%9C%E3%81%AE%E5%8F%A4%E9%83%B7%E3%83%AF%E3%83%BC%E3%83%AB%E3%83%89%E3%83%BB%E5%89%8D%E5%8D%8A).m4a`,
              headers: {
                "User-Agent": "zehuoge",
              },
            });
          }}
          title="Add 6"
        />
      </View>
      <View style={styles.row}>
        <Button
          onPress={async () => {
            await downloadBiliTrack("BV1b84y187WC");
          }}
          title="DL 1"
        />
        <Button
          onPress={async () => {
            await downloadBiliTrack("BV1bb4se5ENA");
          }}
          title="DL 2"
        />
        <Button
          onPress={async () => {
            await downloadBiliTrack("BV1kw411t7iy");
          }}
          title="DL 3"
        />
        <Button
          onPress={async () => {
            await downloadBiliTrack("BV1NH4y1c723");
          }}
          title="DL 4"
        />
        <Button
          onPress={async () => {
            await downloadBiliTrack("BV19U411U7rb");
          }}
          title="DL 5"
        />
      </View>
      <View style={styles.row}>
        <Button
          onPress={async () => {
            await BilisoundPlayer.addDownload(
              "test_track_5",
              `http://${HOST}:8080/%E5%AE%89%E4%BA%95%E6%B4%8B%E4%BB%8B/%E3%81%BE%E3%82%82%E3%82%8B%E3%82%AF%E3%83%B3%E3%81%AF%E5%91%AA%E3%82%8F%E3%82%8C%E3%81%A6%E3%81%97%E3%81%BE%E3%81%A3%E3%81%9F%EF%BC%81%E3%82%A2%E3%83%AC%E3%83%B3%E3%82%B7%E3%82%99%E3%83%88%E3%83%A9%E3%83%83%E3%82%AF%E3%82%B9/05%20YO-KAI%20Disco%20(%E5%86%A5%E7%95%8C%E5%85%A5%E5%8F%A3%E3%83%AF%E3%83%BC%E3%83%AB%E3%83%89).m4a`,
              {
                headers: {
                  "User-Agent": "zehuoge",
                },
              },
            );
          }}
          title="DL 5"
        />
        <Button
          onPress={async () => {
            await BilisoundPlayer.addDownload(
              "test_track_6",
              `http://${HOST}:8080/%E5%AE%89%E4%BA%95%E6%B4%8B%E4%BB%8B/%E3%81%BE%E3%82%82%E3%82%8B%E3%82%AF%E3%83%B3%E3%81%AF%E5%91%AA%E3%82%8F%E3%82%8C%E3%81%A6%E3%81%97%E3%81%BE%E3%81%A3%E3%81%9F%EF%BC%81%E3%82%A2%E3%83%AC%E3%83%B3%E3%82%B7%E3%82%99%E3%83%88%E3%83%A9%E3%83%83%E3%82%AF%E3%82%B9/06%20Blossom%20Shower%20(%E6%A1%9C%E3%81%AE%E5%8F%A4%E9%83%B7%E3%83%AF%E3%83%BC%E3%83%AB%E3%83%89%E3%83%BB%E5%89%8D%E5%8D%8A).m4a`,
              {
                headers: {
                  "User-Agent": "zehuoge",
                },
              },
            );
          }}
          title="DL 6"
        />
        <Button
          onPress={async () => {
            await BilisoundPlayer.addDownload(
              "test_track_large",
              `https://ash-speed.hetzner.com/10GB.bin`,
              {
                headers: {
                  "User-Agent": "zehuoge",
                },
              },
            );
          }}
          title="DL large"
        />
      </View>
      <Button
        onPress={async () =>
          await BilisoundPlayer.replaceTrack(1, {
            id: "test_song",
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
      <Button
        onPress={async () => {
          const res = await BilisoundPlayer.getDownloads();
          console.log(res);
          console.log(typeof res);
        }}
        title="get current downloads"
      />
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
