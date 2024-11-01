package moe.bilisound.player

import android.content.ComponentName
import android.content.Context
import android.os.Handler
import android.os.Looper
import android.util.Log
import androidx.annotation.OptIn
import androidx.core.os.bundleOf
import androidx.media3.common.MediaItem
import androidx.media3.common.PlaybackException
import androidx.media3.common.PlaybackParameters
import androidx.media3.common.Player
import androidx.media3.common.util.UnstableApi
import androidx.media3.datasource.HttpDataSource
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

const val TAG = "BilisoundPlayerModule"

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

        Events(EVENT_PLAYBACK_STATE_CHANGE, EVENT_PLAYBACK_ERROR, EVENT_QUEUE_CHANGE)

        OnCreate {
            mainHandler.post {
                val sessionToken =
                    SessionToken(context, ComponentName(context, BilisoundPlaybackService::class.java))
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
                val controller = getController()
                controller.release()
            }
        }

        OnStartObserving {
            mainHandler.post {
                getController().addListener(listener)
            }
        }

        OnStopObserving {
            mainHandler.post {
                getController().removeListener(listener)
            }
        }

        AsyncFunction("play") { promise: Promise ->
            mainHandler.post {
                try {
                    val controller = getController()
                    controller.play()
                    promise.resolve(null)
                } catch (e: Exception) {
                    promise.reject("PLAYER_ERROR", "无法执行播放操作 (${e.message})", e)
                }
            }
        }

        AsyncFunction("pause") { promise: Promise ->
            mainHandler.post {
                try {
                    val controller = getController()
                    controller.pause()
                    promise.resolve(null)
                } catch (e: Exception) {
                    promise.reject("PLAYER_ERROR", "无法执行暂停操作 (${e.message})", e)
                }
            }
        }

        AsyncFunction("toggle") { promise: Promise ->
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
                    promise.reject("PLAYER_ERROR", "无法切换播放暂停状态 (${e.message})", e)
                }
            }
        }

        AsyncFunction("seek")  { to: Long, promise: Promise ->
            mainHandler.post {
                try {
                    val controller = getController()
                    controller.seekTo(to * 1000)
                    promise.resolve()
                } catch (e: Exception) {
                    promise.reject("PLAYER_ERROR", "无法调整播放进度 (${e.message})", e)
                }
            }
        }

        AsyncFunction("getProgress") { promise: Promise ->
            mainHandler.post {
                try {
                    val controller = getController()
                    val progressInfo = JSONObject().apply {
                        // 总时长（毫秒转秒）
                        put("duration", controller.duration.coerceAtLeast(0) / 1000.0)
                        // 当前播放进度（毫秒转秒）
                        put("position", controller.currentPosition.coerceAtLeast(0) / 1000.0)
                        // 已缓冲进度（毫秒转秒）
                        put("buffered", controller.bufferedPosition.coerceAtLeast(0) / 1000.0)
                    }
                    promise.resolve(progressInfo.toString())
                } catch (e: Exception) {
                    promise.reject("PLAYER_ERROR", "无法获取播放进度 (${e.message})", e)
                }
            }
        }

        AsyncFunction("setSpeed") { speed: Float, retainPitch: Boolean, promise: Promise ->
            mainHandler.post {
                try {
                    Log.d(TAG, "用户尝试调整播放速度。speed: $speed, retainPitch: $retainPitch")
                    val controller = getController()
                    controller.playbackParameters = PlaybackParameters(
                        speed,
                        if (retainPitch) 1.0f else speed
                    )
                    promise.resolve()
                } catch (e: Exception) {
                    promise.reject("PLAYER_ERROR", "无法调整播放速度 (${e.message})", e)
                }
            }
        }

        AsyncFunction("addTrack") { jsonContent: String, promise: Promise ->
            mainHandler.post {
                try {
                    Log.d(TAG, "用户尝试添加曲目。接收内容：$jsonContent")
                    val mediaItem = createMediaItemFromTrack(jsonContent)
                    val controller = getController()
                    controller.addMediaItem(mediaItem)
                    promise.resolve()
                    firePlaylistChangeEvent()
                } catch (e: Exception) {
                    promise.reject("PLAYER_ERROR", "无法添加单首曲目 (${e.message})", e)
                }
            }
        }

        AsyncFunction("addTrackAt") { jsonContent: String, index: Int, promise: Promise ->
            mainHandler.post {
                try {
                    Log.d(TAG, "用户尝试添加曲目到指定位置。接收内容：$jsonContent")
                    val mediaItem = createMediaItemFromTrack(jsonContent)
                    val controller = getController()
                    
                    // 添加曲目到指定的 index
                    controller.addMediaItem(index, mediaItem)
                    
                    promise.resolve()
                    firePlaylistChangeEvent()
                } catch (e: Exception) {
                    promise.reject("PLAYER_ERROR", "无法在指定位置添加曲目 (${e.message})", e)
                }
            }
        }

        AsyncFunction("addTracks") { jsonContent: String, promise: Promise ->
            mainHandler.post {
                try {
                    Log.d(TAG, "用户尝试添加多首曲目")
                    val jsonArray = JSONArray(jsonContent)
                    val mediaItems = mutableListOf<MediaItem>()
                    
                    for (i in 0 until jsonArray.length()) {
                        val trackJson = jsonArray.getString(i)
                        Log.d(TAG, "接收内容：$trackJson")
                        val mediaItem = createMediaItemFromTrack(trackJson)
                        mediaItems.add(mediaItem)
                    }
                    
                    val controller = getController()
                    controller.addMediaItems(mediaItems)
                    promise.resolve()
                    firePlaylistChangeEvent()
                } catch (e: Exception) {
                    promise.reject("PLAYER_ERROR", "无法批量添加曲目 (${e.message})", e)
                }
            }
        }

        AsyncFunction("addTracksAt") { jsonContent: String, index: Int, promise: Promise ->
            mainHandler.post {
                try {
                    Log.d(TAG, "用户尝试添加多首曲目到指定位置。接收内容：$jsonContent")
                    val jsonArray = JSONArray(jsonContent)
                    val mediaItems = mutableListOf<MediaItem>()
                    
                    for (i in 0 until jsonArray.length()) {
                        val trackJson = jsonArray.getString(i)
                        Log.d(TAG, "接收内容：$trackJson")
                        val mediaItem = createMediaItemFromTrack(trackJson)
                        mediaItems.add(mediaItem)
                    }
                    
                    val controller = getController()
                    controller.addMediaItems(index, mediaItems)
                    promise.resolve()
                    firePlaylistChangeEvent()
                } catch (e: Exception) {
                    promise.reject("PLAYER_ERROR", "无法在指定位置批量添加曲目 (${e.message})", e)
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
                    promise.reject("PLAYER_ERROR", "无法获取曲目列表 (${e.message})", e)
                }
            }
        }

        AsyncFunction("replaceTrack") { index: Int, jsonContent: String, promise: Promise ->
            mainHandler.post {
                try {
                    Log.d(TAG, "用户尝试替换曲目。被替换 index: $index, 接收内容: $jsonContent")
                    val controller = getController()
                    if (index < 0 || index >= controller.mediaItemCount) {
                        throw IllegalArgumentException("无效的索引")
                    }

                    val mediaItem = createMediaItemFromTrack(jsonContent)
                    controller.replaceMediaItem(index, mediaItem)

                    promise.resolve()
                    firePlaylistChangeEvent()
                } catch (e: Exception) {
                    promise.reject("PLAYER_ERROR", "无法修改指定曲目信息 (${e.message})", e)
                }
            }
        }

        AsyncFunction("deleteTrack") { index: Int, promise: Promise ->
            mainHandler.post {
                try {
                    Log.d(TAG, "用户尝试删除曲目。被删除 index: $index")
                    val controller = getController()

                    // 验证所有索引是否有效
                    if (index < 0 || index >= controller.mediaItemCount) {
                        throw IllegalArgumentException("无效的索引: $index")
                    }

                    // 删除单个曲目
                    controller.removeMediaItem(index)

                    promise.resolve()
                    firePlaylistChangeEvent()
                } catch (e: Exception) {
                    promise.reject("PLAYER_ERROR", "无法删除指定曲目 (${e.message})", e)
                }
            }
        }

        AsyncFunction("deleteTracks") { jsonContent: String, promise: Promise ->
            mainHandler.post {
                try {
                    Log.d(TAG, "用户尝试删除多个曲目。接收内容: $jsonContent")
                    val controller = getController()
                    val jsonArray = JSONArray(jsonContent)
                    
                    // 将索引转换为列表并排序（从大到小）
                    val indices = mutableListOf<Int>()
                    for (i in 0 until jsonArray.length()) {
                        indices.add(jsonArray.getInt(i))
                    }
                    
                    // 验证所有索引是否有效
                    val invalidIndex = indices.find { it < 0 || it >= controller.mediaItemCount }
                    if (invalidIndex != null) {
                        throw IllegalArgumentException("无效的索引: $invalidIndex")
                    }
                    
                    // 从大到小排序
                    indices.sortDescending()
                    
                    // 从大到小依次删除，这样不会影响后面要删除项目的索引
                    for (index in indices) {
                        controller.removeMediaItem(index)
                    }
                    
                    promise.resolve()
                    firePlaylistChangeEvent()
                } catch (e: Exception) {
                    promise.reject("PLAYER_ERROR", "无法删除指定曲目 (${e.message})", e)
                }
            }
        }
    }

    private fun firePlaylistChangeEvent() {
        this@BilisoundPlayerModule.sendEvent(EVENT_QUEUE_CHANGE, null)
    }

    private val listener = object : Player.Listener {
        override fun onPlayerError(error: PlaybackException) {
            val cause = error.cause
            if (cause is HttpDataSource.HttpDataSourceException) {
                // An HTTP error occurred.
                val httpError = cause
                // It's possible to find out more about the error both by casting and by querying
                // the cause.
                if (httpError is HttpDataSource.InvalidResponseCodeException) {
                    // Cast to InvalidResponseCodeException and retrieve the response code, message
                    // and headers.
                    this@BilisoundPlayerModule.sendEvent(EVENT_PLAYBACK_ERROR, bundleOf(
                        "type" to ERROR_BAD_HTTP_STATUS_CODE,
                        "message" to httpError.message,
                        "code" to httpError.responseCode
                    ))
                } else {
                    // Try calling httpError.getCause() to retrieve the underlying cause, although
                    // note that it may be null.
                    this@BilisoundPlayerModule.sendEvent(EVENT_PLAYBACK_ERROR, bundleOf(
                        "type" to ERROR_NETWORK_FAILURE,
                        "message" to httpError.message,
                    ))
                }
            } else {
                this@BilisoundPlayerModule.sendEvent(EVENT_PLAYBACK_ERROR, bundleOf(
                    "type" to ERROR_GENERIC,
                    "message" to cause?.message,
                ))
            }
        }

        override fun onPlaybackStateChanged(playbackState: Int) {
            var type = ""
            if (playbackState == Player.STATE_IDLE) {
                type = STATE_IDLE
            }
            if (playbackState == Player.STATE_BUFFERING) {
                type = STATE_BUFFERING
            }
            if (playbackState == Player.STATE_READY) {
                type = STATE_READY
            }
            if (playbackState == Player.STATE_ENDED) {
                type = STATE_ENDED
            }

            this@BilisoundPlayerModule.sendEvent(EVENT_PLAYBACK_STATE_CHANGE, bundleOf(
                "type" to type,
            ))
        }
    }
}
