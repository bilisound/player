package moe.bilisound.player
import kotlinx.serialization.Serializable

@Serializable
data class TrackData(
    /**
     * Track File URI
     */
    val uri: String,
    /**
     * Artwork File URI
     */
    val artworkUri: String?,
    /**
     * Title
     */
    val title: String?,
    /**
     * Artist
     */
    val artist: String?,
    /**
     * Duration
     */
    val duration: Long?,
    /**
     * HTTP Headers, stored in JSON key-value pair.
     *
     * Example:
     *
     * ```json
     * {"foo":"bar","User-Agent":"something 123456"}
     * ```
     */
    val httpHeaders: String?,
    /**
     * Extended data of track, maybe useful for JavaScript/TypeScript side.
     */
    val extendedData: String?,
)
