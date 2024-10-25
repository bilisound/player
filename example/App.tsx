import { StyleSheet, Text, View } from 'react-native';

import * as BilisoundPlayer from 'bilisound-player';

export default function App() {
  return (
    <View style={styles.container}>
      <Text>{BilisoundPlayer.hello()}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
