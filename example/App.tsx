import * as BilisoundPlayer from "bilisound-player";
import { Button, StyleSheet, Text, View } from "react-native";

export default function App() {
  return (
    <View style={styles.container}>
      <Text>Music Player</Text>
      <Button onPress={() => BilisoundPlayer.playAudio()} title="Begin Play" />
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
  },
});
