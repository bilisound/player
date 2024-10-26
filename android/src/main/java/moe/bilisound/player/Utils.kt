package moe.bilisound.player

import android.net.Uri
import android.os.Bundle
import androidx.media3.common.MediaItem
import androidx.media3.common.MediaMetadata
import kotlinx.serialization.json.Json

@androidx.annotation.OptIn(androidx.media3.common.util.UnstableApi::class)
fun createMediaItemFromTrack(json: String): MediaItem {
    val output = Json.decodeFromString<TrackData>(json)

    val extras = Bundle().apply {
        if (output.httpHeaders != null) {
            putString("httpHeaders", output.httpHeaders)
        }
        if (output.extendedData != null) {
            putString("extendedData", output.extendedData)
        }
    }

    val mediaMetadata = MediaMetadata.Builder().apply {
        if (output.artworkUri != null) {
            setArtworkUri(Uri.parse(output.artworkUri))
        }
        if (output.title != null) {
            setTitle(output.title)
        }
        if (output.artist != null) {
            setArtist(output.artist)
        }
        if (output.duration != null) {
            setDurationMs(output.duration * 1000)
        }
        setExtras(extras)
    }.build()

    val testItem = MediaItem
        .Builder()
        .setUri(output.uri)
        .setMediaMetadata(mediaMetadata)
        .build()

    return testItem
}