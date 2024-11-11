@file:OptIn(UnstableApi::class) package moe.bilisound.player

import android.os.Handler
import android.os.Looper
import androidx.annotation.OptIn
import androidx.media3.common.util.UnstableApi
import androidx.media3.datasource.cache.CacheDataSource
import androidx.media3.exoplayer.ExoPlayer
import androidx.media3.exoplayer.source.DefaultMediaSourceFactory
import androidx.media3.session.MediaSession
import androidx.media3.session.MediaSessionService
import com.google.common.util.concurrent.Futures
import com.google.common.util.concurrent.ListenableFuture
import java.util.concurrent.Executor

class BilisoundPlaybackService : MediaSessionService() {
    private var mediaSession: MediaSession? = null

    // Create your Player and MediaSession in the onCreate lifecycle event
    @OptIn(UnstableApi::class) override fun onCreate() {
        super.onCreate()

        // 创建自定义的 DataSource.Factory 并整合缓存功能
        val dataSourceFactory = CacheDataSource.Factory()
            .setCache(BilisoundPlayerModule.getDownloadCache(applicationContext)) // 确保 downloadCache 已正确初始化
            .setUpstreamDataSourceFactory {
                BilisoundPlayerModule.getDataSourceFactory()
                    .createDataSource()
            }
            .setCacheWriteDataSinkFactory(null) // 禁用写入

        // 使用整合后的 DataSource.Factory 创建 MediaSourceFactory
        val mediaSourceFactory = DefaultMediaSourceFactory(dataSourceFactory)

        // 使用自定义的 MediaSourceFactory 创建 ExoPlayer
        val player = ExoPlayer.Builder(this)
            .setMediaSourceFactory(mediaSourceFactory)
            .build()

        mediaSession = MediaSession.Builder(this, player).setId("moe.bilisound.player").setCallback(PlaybackCallback()).build()
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

private class PlaybackCallback : MediaSession.Callback {
    override fun onPlaybackResumption(
        mediaSession: MediaSession,
        controller: MediaSession.ControllerInfo
    ): ListenableFuture<MediaSession.MediaItemsWithStartPosition> {
        // 创建一个立即完成的 Future，返回空的媒体项目列表和起始位置 0
        return Futures.immediateFuture(
            MediaSession.MediaItemsWithStartPosition(
                /* mediaItems = */ emptyList(),
                /* startIndex = */ 0,
                /* startPositionMs = */ 0L
            )
        )
    }
}