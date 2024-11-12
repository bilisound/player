package moe.bilisound.player

import android.app.job.JobParameters
import android.app.job.JobService
import android.content.Context
import android.content.Intent
import android.util.Log
import expo.modules.core.interfaces.LifecycleEventListener
import expo.modules.interfaces.taskManager.TaskConsumer
import expo.modules.interfaces.taskManager.TaskConsumerInterface
import expo.modules.interfaces.taskManager.TaskInterface
import expo.modules.interfaces.taskManager.TaskManagerUtilsInterface

class BackgroundTaskConsumer(context: Context?, taskManagerUtils: TaskManagerUtilsInterface?) :
    TaskConsumer(context, taskManagerUtils), TaskConsumerInterface, LifecycleEventListener {
    companion object {
        private const val TAG = "BackgroundTaskConsumer"
        const val ACTION_JS_WAKEUP_EVENT: String =
            "moe.bilisound.player.BackgroundTaskConsumer.JS_WAKEUP_EVENT"
    }

    private lateinit var taskInterface: TaskInterface

    override fun taskType(): String {
        Log.d(TAG, "taskType: ")
        return "backgroundEventTask"
    }

    override fun canReceiveCustomBroadcast(action: String): Boolean {
        Log.d(TAG, "canReceiveCustomBroadcast: $action")
        return ACTION_JS_WAKEUP_EVENT == action
    }

    override fun didRegister(task: TaskInterface) {
        Log.d(TAG, "didRegister: $task")
        taskInterface = task
    }

    override fun didUnregister() {
        Log.d(TAG, "didUnregister: ")
    }

    override fun didReceiveBroadcast(intent: Intent) {
        Log.d(TAG, "didReceiveBroadcast: $intent")
    }

    override fun didExecuteJob(jobService: JobService, params: JobParameters): Boolean {
        Log.d(TAG, "didExecuteJob: $jobService, $params")
        return true
    }

    override fun onHostResume() {
        Log.d(TAG, "onHostResume: ")
    }

    override fun onHostPause() {
        Log.d(TAG, "onHostPause: ")
    }

    override fun onHostDestroy() {
        Log.d(TAG, "onHostDestroy: ")
    }
}
