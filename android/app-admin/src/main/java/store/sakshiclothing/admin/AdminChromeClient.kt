package store.sakshiclothing.admin

import android.net.Uri
import android.os.Message
import android.view.View
import android.webkit.ValueCallback
import android.webkit.WebChromeClient
import android.webkit.WebView
import android.widget.ProgressBar

class AdminChromeClient(
    private val activity: MainActivity,
    private val progressBar: ProgressBar,
    private val onFileChooseCallback: (ValueCallback<Array<Uri>>?, WebChromeClient.FileChooserParams?) -> Boolean
) : WebChromeClient() {

    override fun onProgressChanged(view: WebView?, newProgress: Int) {
        super.onProgressChanged(view, newProgress)
        try {
            if (newProgress < 100) {
                progressBar.visibility = View.VISIBLE
                progressBar.progress = newProgress
            } else {
                progressBar.visibility = View.GONE
            }
        } catch (_: Throwable) {}
    }

    override fun onShowFileChooser(
        webView: WebView?,
        filePathCallback: ValueCallback<Array<Uri>>?,
        fileChooserParams: FileChooserParams?
    ): Boolean {
        return try {
            onFileChooseCallback(filePathCallback, fileChooserParams)
        } catch (_: Throwable) {
            filePathCallback?.onReceiveValue(null)
            false
        }
    }

    override fun onCreateWindow(
        view: WebView?,
        isDialog: Boolean,
        isUserGesture: Boolean,
        resultMsg: Message?
    ): Boolean {
        // Prevent fatal Chromium crash caused by assigning parent view to transport.webView
        try {
            val href = view?.handler?.obtainMessage()
            view?.requestFocusNodeHref(href)
            val url = href?.data?.getString("url")
            if (!url.isNullOrBlank()) {
                view.loadUrl(url)
            }
        } catch (_: Throwable) {}
        return false
    }
}
