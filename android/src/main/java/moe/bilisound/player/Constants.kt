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
