import { useQueue } from "bilisound-player/hooks/useQueue";
import { View, Text } from "react-native";

export function Playlist() {
  const queue = useQueue();

  return (
    <View>
      <Text>Playlist</Text>
      {queue.map((e, i) => {
        return <Text key={i}>{e.title}</Text>;
      })}
    </View>
  );
}
