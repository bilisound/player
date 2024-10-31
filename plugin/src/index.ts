import { ConfigPlugin, withAndroidManifest } from "@expo/config-plugins";
import { AndroidManifest } from "@expo/config-plugins/build/android/Manifest";

function tryAddPermission(manifest: AndroidManifest["manifest"], name: string) {
  if (!manifest["uses-permission"]?.find((e) => e.$["android:name"] === name)) {
    manifest["uses-permission"]?.push({
      $: {
        "android:name": name,
      },
    });
  }
}

const withBilisoundPlayer: ConfigPlugin = (config) => {
  return withAndroidManifest(config, (config) => {
    // 访问 AndroidManifest
    const { manifest } = config.modResults;

    tryAddPermission(manifest, "android.permission.FOREGROUND_SERVICE");
    tryAddPermission(
      manifest,
      "android.permission.FOREGROUND_SERVICE_MEDIA_PLAYBACK",
    );

    console.log(manifest?.application);

    if (
      !manifest?.application?.[0].service?.find(
        (e) =>
          e.$["android:name"] ===
          "moe.bilisound.player.BilisoundPlaybackService",
      )
    ) {
      if (!manifest?.application) {
        manifest.application = [];
      }
      if (!manifest?.application[0].service) {
        manifest.application[0].service = [];
      }
      manifest?.application?.[0].service?.push({
        $: {
          "android:name": "moe.bilisound.player.BilisoundPlaybackService",
          // @ts-ignore
          "android:foregroundServiceType": "mediaPlayback",
          "android:exported": "false",
        },
        "intent-filter": [
          {
            action: [
              {
                $: {
                  "android:name": "androidx.media3.session.MediaSessionService",
                },
              },
            ],
          },
        ],
      });
    }

    return config;
  });
};

export default withBilisoundPlayer;
