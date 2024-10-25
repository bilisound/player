package moe.bilisound.player

import androidx.media3.common.MediaItem
import androidx.media3.exoplayer.ExoPlayer
import androidx.media3.session.MediaSession
import androidx.media3.session.MediaSessionService

class PlaybackService : MediaSessionService() {
    private var mediaSession: MediaSession? = null

    // Create your Player and MediaSession in the onCreate lifecycle event
    override fun onCreate() {
        super.onCreate()
        val player = ExoPlayer.Builder(this).build()
        val mediaItem =
            MediaItem.fromUri("https://assets.tcdww.cn/website/test/14%20Horsey%20(feat.%20Sarah%20Bonito).m4a")
        mediaSession = MediaSession.Builder(this, player).setId("moe.bilisound.player").build()
        player.clearMediaItems()
        player.addMediaItem(mediaItem)
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
