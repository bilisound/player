@file:OptIn(UnstableApi::class) package moe.bilisound.player

import android.annotation.SuppressLint
import android.app.Notification
import android.util.Log
import androidx.annotation.OptIn
import androidx.media3.common.util.UnstableApi
import androidx.media3.exoplayer.offline.Download
import androidx.media3.exoplayer.offline.DownloadManager
import androidx.media3.exoplayer.offline.DownloadService
import androidx.media3.exoplayer.scheduler.PlatformScheduler
import androidx.media3.exoplayer.scheduler.Scheduler

class BilisoundDownloadService
    () : DownloadService(
    FOREGROUND_NOTIFICATION_ID,
    DEFAULT_FOREGROUND_NOTIFICATION_UPDATE_INTERVAL,
    DOWNLOAD_NOTIFICATION_CHANNEL_ID,
    androidx.media3.exoplayer.R.string.exo_download_notification_channel_name,
    0
) {
    companion object {
        const val JOB_ID = 1
        const val FOREGROUND_NOTIFICATION_ID = 1
        const val DOWNLOAD_NOTIFICATION_CHANNEL_ID = "notification_channel"
    }

    override fun onCreate() {
        Log.d(TAG, "创建服务")
        super.onCreate()
    }

    override fun getDownloadManager(): DownloadManager {
        Log.d(TAG, "下载管理器在下载服务初始化！")
        return BilisoundPlayerModule.getDownloadManager(applicationContext)
    }

    @SuppressLint("MissingPermission")
    override fun getScheduler(): Scheduler {
        return PlatformScheduler(this, JOB_ID)
    }

    override fun getForegroundNotification(
        downloads: MutableList<Download>,
        notMetRequirements: Int
    ): Notification {
        return BilisoundPlayerModule.getDownloadNotificationHelper( /* context= */this)
            .buildProgressNotification( /* context= */
                this,
                R.drawable.ic_download,  /* contentIntent= */
                null,  /* message= */
                null,
                downloads,
                notMetRequirements
            )
    }
}
