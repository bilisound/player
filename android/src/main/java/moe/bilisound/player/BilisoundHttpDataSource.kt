@file:OptIn(UnstableApi::class) package moe.bilisound.player

import android.net.Uri
import androidx.annotation.OptIn
import androidx.media3.common.util.UnstableApi
import androidx.media3.datasource.DataSpec
import androidx.media3.datasource.DefaultHttpDataSource
import androidx.media3.datasource.HttpDataSource
import androidx.media3.datasource.TransferListener

class BilisoundHttpDataSource private constructor(
    private val defaultHttpDataSource: DefaultHttpDataSource
) : HttpDataSource {
    // 工厂类
    class Factory : HttpDataSource.Factory {
        private val defaultFactory = DefaultHttpDataSource.Factory()

        // 保存单个 CustomHttpDataSource 实例
        private var dataSource: BilisoundHttpDataSource? = null

        override fun createDataSource(): HttpDataSource {
            if (dataSource == null) {
                dataSource = BilisoundHttpDataSource(
                    defaultFactory.createDataSource()
                )
            }
            return dataSource!!
        }

        override fun setDefaultRequestProperties(defaultRequestProperties: MutableMap<String, String>): HttpDataSource.Factory {
            TODO("Not yet implemented")
        }
    }

    override fun open(dataSpec: DataSpec): Long {
        BilisoundPlayerModule.downloadData?.let {
            val handledSpec = dataSpec.withAdditionalHeaders(it.headers)
            return defaultHttpDataSource.open(handledSpec)
        }
        throw Exception("试图在没有设定 BilisoundPlayerModule.downloadData 的情况下进行下载操作")
    }


    // 以下是委托给 defaultHttpDataSource 的实现
    override fun read(buffer: ByteArray, offset: Int, length: Int): Int {
        return defaultHttpDataSource.read(buffer, offset, length)
    }

    override fun addTransferListener(transferListener: TransferListener) {
        return defaultHttpDataSource.addTransferListener(transferListener)
    }

    override fun getUri(): Uri? = defaultHttpDataSource.uri

    override fun getResponseHeaders(): Map<String, List<String>> {
        return defaultHttpDataSource.responseHeaders
    }

    override fun close() = defaultHttpDataSource.close()

    override fun getResponseCode(): Int = defaultHttpDataSource.responseCode

    override fun clearRequestProperty(name: String) {
        defaultHttpDataSource.clearRequestProperty(name)
    }

    override fun clearAllRequestProperties() {
        defaultHttpDataSource.clearAllRequestProperties()
    }

    override fun setRequestProperty(name: String, value: String) {
        defaultHttpDataSource.setRequestProperty(name, value)
    }
}