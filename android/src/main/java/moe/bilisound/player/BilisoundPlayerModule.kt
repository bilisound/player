package moe.bilisound.player

import android.content.Context
import android.os.Handler
import android.os.Looper
import androidx.annotation.OptIn
import androidx.media3.common.MediaItem
import androidx.media3.common.util.UnstableApi
import androidx.media3.exoplayer.ExoPlayer
import expo.modules.kotlin.Promise
import expo.modules.kotlin.exception.Exceptions
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

class BilisoundPlayerModule : Module() {
  private var player: ExoPlayer? = null
  private val mainHandler = Handler(Looper.getMainLooper())
  private val context: Context
    get() = appContext.reactContext ?: throw Exceptions.ReactContextLost()

  @OptIn(UnstableApi::class) override fun definition() = ModuleDefinition {
    Name("BilisoundPlayer")

    OnCreate {
      mainHandler.post {
        player = ExoPlayer.Builder(context)
          .setLooper(Looper.getMainLooper())
          .build()
      }
    }

    OnDestroy {
      mainHandler.post {
        player?.release()
        player = null
      }
    }

    AsyncFunction("playAudio") { promise: Promise ->
      mainHandler.post {
        try {
          val audioUrl = "https://assets.tcdww.cn/website/test/14%20Horsey%20(feat.%20Sarah%20Bonito).m4a"
          val mediaItem = MediaItem.fromUri(audioUrl)

          player?.apply {
            clearMediaItems()
            addMediaItem(mediaItem)
            prepare()
            play()
            promise.resolve(null)
          } ?: promise.reject("PLAYER_ERROR", "Player not initialized", null)
        } catch (e: Exception) {
          promise.reject("PLAYER_ERROR", "", e)
        }
      }
    }

    AsyncFunction("togglePlayback") { promise: Promise ->
      mainHandler.post {
        try {
          val isPlaying = player?.let {
            if (it.isPlaying) {
              it.pause()
            } else {
              it.play()
            }
            it.isPlaying
          } ?: false
          promise.resolve(isPlaying)
        } catch (e: Exception) {
          promise.reject("PLAYER_ERROR", "", e)
        }
      }
    }

    AsyncFunction("stop") { promise: Promise ->
      mainHandler.post {
        try {
          player?.stop()
          promise.resolve(null)
        } catch (e: Exception) {
          promise.reject("PLAYER_ERROR", "", e)
        }
      }
    }
  }
}