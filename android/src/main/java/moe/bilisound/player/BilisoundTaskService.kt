package moe.bilisound.player

import android.app.NotificationChannel
import android.app.NotificationManager
import android.content.Context
import android.content.Intent
import android.content.pm.ServiceInfo
import android.os.Build
import androidx.core.app.NotificationCompat
import com.facebook.react.HeadlessJsTaskService
import com.facebook.react.bridge.Arguments
import com.facebook.react.jstasks.HeadlessJsTaskConfig

class BilisoundTaskService: HeadlessJsTaskService() {
    private val CHANNEL_ID = "ShortServiceChannel"

    override fun onCreate() {
        super.onCreate()
        // 创建通知渠道
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                CHANNEL_ID,
                "播放事件服务",
                NotificationManager.IMPORTANCE_LOW
            ).apply {
                description = "用于处理播放事件的服务通知"
            }
            
            val notificationManager = getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
            notificationManager.createNotificationChannel(channel)
        }
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        // 创建通知
        val notification = NotificationCompat.Builder(this, CHANNEL_ID)
            .setContentTitle("播放事件服务")
            .setContentText("正在处理播放事件……")
            .setSmallIcon(R.drawable.ic_download)
            .build()

        // 创建只会执行数秒的短服务，以便库用户进行关于音乐播放事件的操作
        startForeground(1, notification, ServiceInfo.FOREGROUND_SERVICE_TYPE_SHORT_SERVICE)

        return super.onStartCommand(intent, flags, startId)
    }

    override fun getTaskConfig(intent: Intent): HeadlessJsTaskConfig? {
        return intent.extras?.let {
            HeadlessJsTaskConfig(
                "BilisoundPlayerTask",
                Arguments.fromBundle(it),
                5000, // timeout for the task
                true // optional: defines whether or not the task is allowed in foreground.
                // Default is false
            )
        }
    }
}