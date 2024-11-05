package moe.bilisound.player

import android.net.Uri
import android.os.Bundle
import androidx.core.os.bundleOf
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
        .setMediaId(output.id)
        .setCustomCacheKey(output.id)
        .setMediaMetadata(mediaMetadata)
        .build()

    return testItem
}

@androidx.annotation.OptIn(androidx.media3.common.util.UnstableApi::class)
fun mediaItemToBundle(mediaItem: MediaItem): Bundle {
    val metadata = mediaItem.mediaMetadata
    return bundleOf(
        "id" to mediaItem.mediaId,
        "uri" to mediaItem.localConfiguration?.uri?.toString(),
        "artworkUri" to metadata.artworkUri?.toString(),
        "title" to metadata.title,
        "artist" to metadata.artist,
        "duration" to (metadata.durationMs?.div(1000) ?: 0),
        "httpHeaders" to metadata.extras?.getString("httpHeaders"),
        "extendedData" to metadata.extras?.getString("extendedData")
    )
}