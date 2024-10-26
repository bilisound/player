package moe.bilisound.player

import android.content.ComponentName
import android.content.Context
import android.os.Handler
import android.os.Looper
import androidx.annotation.OptIn
import androidx.media3.common.util.UnstableApi
import androidx.media3.session.MediaController
import androidx.media3.session.SessionToken
import com.google.common.util.concurrent.ListenableFuture
import com.google.common.util.concurrent.MoreExecutors
import expo.modules.kotlin.Promise
import expo.modules.kotlin.exception.Exceptions
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import org.json.JSONArray
import org.json.JSONObject

class BilisoundPlayerModule : Module() {
    private val mainHandler = Handler(Looper.getMainLooper())
    private val context: Context
        get() = appContext.reactContext ?: throw Exceptions.ReactContextLost()
    private var controllerFuture: ListenableFuture<MediaController>? = null

    private fun getController(): MediaController {
        val controller = controllerFuture?.get() ?: throw Exception("Controller not ready")
        return controller
    }

    @OptIn(UnstableApi::class)
    override fun definition() = ModuleDefinition {
        Name("BilisoundPlayer")

        OnCreate {
            mainHandler.post {
                val sessionToken =
                    SessionToken(context, ComponentName(context, PlaybackService::class.java))
                controllerFuture = MediaController.Builder(context, sessionToken).buildAsync()
                controllerFuture!!.addListener(
                    {
                        // Call controllerFuture.get() to retrieve the MediaController.
                        // MediaController implements the Player interface, so it can be
                        // attached to the PlayerView UI component.
                        // playerView.setPlayer(controllerFuture.get())
                    },
                    MoreExecutors.directExecutor()
                )
            }
        }

        OnDestroy {
            mainHandler.post {
            }
        }

        AsyncFunction("play") { promise: Promise ->
            mainHandler.post {
                try {
                    val controller = getController()
                    controller.play()
                    promise.resolve(null)
                } catch (e: Exception) {
                    promise.reject("PLAYER_ERROR", "", e)
                }
            }
        }

        AsyncFunction("togglePlayback") { promise: Promise ->
            mainHandler.post {
                try {
                    val controller = getController()
                    if (controller.isPlaying()) {
                        controller.pause()
                    } else {
                        controller.play()
                    }
                    promise.resolve()
                } catch (e: Exception) {
                    promise.reject("PLAYER_ERROR", "", e)
                }
            }
        }

        AsyncFunction("addTrack") { jsonContent: String, promise: Promise ->
            mainHandler.post {
                try {
                    val mediaItem = createMediaItemFromTrack(jsonContent)
                    val controller = getController()
                    controller.addMediaItem(mediaItem)
                    promise.resolve()
                } catch (e: Exception) {
                    promise.reject("PLAYER_ERROR", "Unable to add single track", e)
                }
            }
        }

        AsyncFunction("getTracks") { promise: Promise ->
            mainHandler.post {
                try {
                    val controller = getController()
                    val tracks = JSONArray()

                    for (i in 0 until controller.mediaItemCount) {
                        val mediaItem = controller.getMediaItemAt(i)
                        val metadata = mediaItem.mediaMetadata
                        
                        val trackInfo = JSONObject().apply {
                            put("uri", mediaItem.localConfiguration?.uri?.toString() ?: "")
                            put("artworkUri", metadata.artworkUri?.toString())
                            put("title", metadata.title)
                            put("artist", metadata.artist)
                            put("duration", metadata.durationMs?.div(1000) ?: 0)
                            put("httpHeaders", metadata.extras?.getString("httpHeaders"))
                            put("extendedData", metadata.extras?.getString("extendedData"))
                        }
                        
                        tracks.put(trackInfo)
                    }

                    promise.resolve(tracks.toString())
                } catch (e: Exception) {
                    promise.reject("PLAYER_ERROR", "无法获取曲目列表", e)
                }
            }
        }

        Events("onPlaybackStateChange")
    }
}
