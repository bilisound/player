package moe.bilisound.player

// ============================================================================
// 事件
// ============================================================================

/**
 * 播放状态变更
 */
const val EVENT_PLAYBACK_STATE_CHANGE = "onPlaybackStateChange"

/**
 * 播放错误
 */
const val EVENT_PLAYBACK_ERROR = "onPlaybackError"

/**
 * 播放队列变更
 */
const val EVENT_QUEUE_CHANGE = "onQueueChange"

/**
 * 播放曲目变更
 */
const val EVENT_TRACK_CHANGE = "onTrackChange"

/**
 * 是否播放变更
 */
const val EVENT_IS_PLAYING_CHANGE = "onIsPlayingChange"

/**
 * 下载内容状态变更
 */
const val EVENT_DOWNLOAD_STATUS_CHANGE = "onDownloadStatusChange"

/**
 * 下载内容删除
 */
const val EVENT_DOWNLOAD_REMOVE = "onDownloadRemove"

/**
 * 全局下载状态变更
 */
const val EVENT_DOWNLOAD_GLOBAL_STATE_CHANGE = "onDownloadGlobalStatusChange"

// ============================================================================
// 播放状态
// ============================================================================

const val STATE_IDLE = "STATE_IDLE"
const val STATE_BUFFERING = "STATE_BUFFERING"
const val STATE_READY = "STATE_READY"
const val STATE_ENDED = "STATE_ENDED"

// ============================================================================
// 错误信息
// ============================================================================

/**
 * 网络请求失败
 */
const val ERROR_NETWORK_FAILURE = "ERROR_NETWORK_FAILURE"

/**
 * HTTP 状态码异常
 */
const val ERROR_BAD_HTTP_STATUS_CODE = "ERROR_BAD_HTTP_STATUS_CODE"

/**
 * 其它错误
 */
const val ERROR_GENERIC = "ERROR_GENERIC"
