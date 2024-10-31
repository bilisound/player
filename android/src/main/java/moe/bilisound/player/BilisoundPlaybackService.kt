package moe.bilisound.player

import android.os.Handler
import android.os.Looper
import android.util.Log
import androidx.annotation.OptIn
import androidx.media3.common.util.UnstableApi
import androidx.media3.datasource.DataSource
import androidx.media3.datasource.DefaultHttpDataSource
import androidx.media3.exoplayer.ExoPlayer
import androidx.media3.exoplayer.source.DefaultMediaSourceFactory
import androidx.media3.session.MediaSession
import androidx.media3.session.MediaSessionService
import org.json.JSONObject
import java.util.concurrent.Executor

class BilisoundPlaybackService : MediaSessionService() {
    private var mediaSession: MediaSession? = null
    private val mainThreadExecutor = MainThreadExecutor()

    val TAG = "BilisoundPlaybackService"

    // Create your Player and MediaSession in the onCreate lifecycle event
    @OptIn(UnstableApi::class) override fun onCreate() {
        super.onCreate()
        
        // 创建自定义的 DataSource.Factory
        val httpDataSourceFactory = DataSource.Factory {
            DefaultHttpDataSource.Factory()
                .setDefaultRequestProperties(mapOf(
                    "User-Agent" to "BiliSound Android App"
                ))
                .createDataSource()
                .apply {
                    mainThreadExecutor.execute {
                        val currentItem = mediaSession?.player?.currentMediaItem
                        val extras = currentItem?.mediaMetadata?.extras

                        // 可以在 extras 的 headers 存放 JSON 键值对对象，这样可以应用到 HTTP Header 上
                        if (extras != null) {
                            val headers = extras.getString("httpHeaders")?.let { JSONObject(it) }
                            headers?.keys()?.forEach { key ->
                                val value = headers.get(key)
                                Log.d(TAG, "Setting header for HTTP request. Key: $key, Value: $value")
                                setRequestProperty(key.trim(), (value as String).trim())
                            }
                        }
                    }
                }
        }

        // 使用自定义的 DataSource.Factory 创建 MediaSourceFactory
        val mediaSourceFactory = DefaultMediaSourceFactory(httpDataSourceFactory)

        // 使用自定义的 MediaSourceFactory 创建 ExoPlayer
        val player = ExoPlayer.Builder(this)
            .setMediaSourceFactory(mediaSourceFactory)
            .build()
        mediaSession = MediaSession.Builder(this, player).setId("moe.bilisound.player").build()
        player.clearMediaItems()
        player.prepare()
    }

    // Remember to release the player and media session in onDestroy
    override fun onDestroy() {
        mediaSession?.run {
            player.release()
            release()
            mediaSession = null
        }
        super.onDestroy()
    }

    // This example always accepts the connection request
    override fun onGetSession(
        controllerInfo: MediaSession.ControllerInfo
    ): MediaSession? = mediaSession
}

private class MainThreadExecutor : Executor {
    private val handler = Handler(Looper.getMainLooper())
    override fun execute(command: Runnable) {
        handler.post(command)
    }
}
