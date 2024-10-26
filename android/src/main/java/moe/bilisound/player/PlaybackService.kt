package moe.bilisound.player

import android.os.Bundle
import android.os.Handler
import android.os.Looper
import androidx.annotation.OptIn
import androidx.media3.common.MediaItem
import androidx.media3.common.MediaMetadata
import androidx.media3.common.util.UnstableApi
import androidx.media3.datasource.DataSource
import androidx.media3.datasource.DefaultHttpDataSource
import androidx.media3.exoplayer.ExoPlayer
import androidx.media3.exoplayer.source.DefaultMediaSourceFactory
import androidx.media3.session.MediaSession
import androidx.media3.session.MediaSessionService
import java.util.concurrent.Executor

class PlaybackService : MediaSessionService() {
    private var mediaSession: MediaSession? = null
    private val mainThreadExecutor = MainThreadExecutor()

    // Create your Player and MediaSession in the onCreate lifecycle event
    @OptIn(UnstableApi::class) override fun onCreate() {
        super.onCreate()
        
        // 创建自定义的 DataSource.Factory
        val httpDataSourceFactory = object : DataSource.Factory {
            override fun createDataSource(): DataSource {
                return DefaultHttpDataSource.Factory()
                    .setDefaultRequestProperties(mapOf(
                        "User-Agent" to "BiliSound Android App"
                    ))
                    .createDataSource()
                    .apply {
                        mainThreadExecutor.execute {
                            val currentItem = mediaSession?.player?.currentMediaItem
                            val extras = currentItem?.mediaMetadata?.extras
                            if (extras != null) {
                                val headers = extras.getString("headers")?.split(",")
                                headers?.forEach { header ->
                                    val (key, value) = header.split(":")
                                    setRequestProperty(key.trim(), value.trim())
                                }
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
        player.addMediaItem(
            MediaItem.fromUri("http://10.0.2.2:3000/Music/Media.localized/Music/asmi/PAKU%20-%20Single/01%20PAKU.m4a")
        )

        val extras = Bundle().apply {
            putString("foo", "zehuoge")
            putString("headers", "User-Agent:shanhuobi")
        }
        val mediaMetadata = MediaMetadata.Builder()
            .setDisplayTitle("test title")
            .setExtras(extras)
            .build()
        val testItem = MediaItem
            .Builder()
            .setUri("http://10.0.2.2:3000/Music/Media.localized/Music/Hoshimachi%20Suisei/SelfishDazzling%20_%20bye%20bye%20rainy%20-%20EP/02%20Bye%20Bye%20Rainy.m4a")
            .setMediaMetadata(mediaMetadata)
            .build()

        player.addMediaItem(
            testItem
        )
        player.addMediaItem(
            MediaItem.fromUri("http://10.0.2.2:3000/Music/Media.localized/Music/Denki%20Groove/A/09%20Shangri-La.m4a")
        )
        player.addMediaItem(
            MediaItem.fromUri("http://10.0.2.2:3000/Music/Media.localized/Music/Natsume%20Itsuki/Trade-Off%20-%20Single/01%20Trade-Off.m4a")
        )
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
