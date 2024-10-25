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
        mediaSession = MediaSession.Builder(this, player).setId("moe.bilisound.player").build()
        player.clearMediaItems()
        player.addMediaItem(
            MediaItem.fromUri("http://10.0.2.2:3000/Music/Media.localized/Music/asmi/PAKU%20-%20Single/01%20PAKU.m4a")
        )
        player.addMediaItem(
            MediaItem.fromUri("http://10.0.2.2:3000/Music/Media.localized/Music/Hoshimachi%20Suisei/SelfishDazzling%20_%20bye%20bye%20rainy%20-%20EP/02%20Bye%20Bye%20Rainy.m4a")
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
