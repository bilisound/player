import { ConfigPlugin, withAndroidManifest } from "@expo/config-plugins";

const withBilisoundPlayer: ConfigPlugin = (config) => {
  return withAndroidManifest(config, async (config) => {
    return config;
  });
};

export default withBilisoundPlayer;
