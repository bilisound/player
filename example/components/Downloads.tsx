import { pauseDownload, removeDownload } from "bilisound-player";
import { useDownloadTasks } from "bilisound-player/hooks/useDownloadTasks";
import { DownloadState } from "bilisound-player/types";
import { View, Text, StyleSheet, Button } from "react-native";

export function Downloads() {
  const tasks = useDownloadTasks();

  console.log(tasks.length);

  return (
    <View>
      <Text>Downloads</Text>
      <View style={styles.list}>
        {tasks.map((tasks) => {
          return (
            <View style={styles.listItem} key={tasks.id}>
              <Text>{tasks.id}</Text>
              <Text>{`${(tasks.bytesDownloaded / tasks.bytesTotal) * 100}%`}</Text>
              <View style={styles.listAction}>
                <Button
                  title="Delete"
                  onPress={() => removeDownload(tasks.id)}
                />
                {tasks.state === DownloadState.STATE_DOWNLOADING && (
                  <Button
                    title="Pause"
                    onPress={() => pauseDownload(tasks.id)}
                  />
                )}
                {tasks.state !== DownloadState.STATE_DOWNLOADING &&
                  tasks.state !== DownloadState.STATE_COMPLETED && (
                    <Button
                      title={`Resume (${tasks.state})`}
                      onPress={() => pauseDownload(tasks.id)}
                    />
                  )}
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: 8,
    marginTop: 8,
  },
  listItem: {
    gap: 4,
  },
  listAction: {
    gap: 8,
    flexDirection: "row",
  },
});
