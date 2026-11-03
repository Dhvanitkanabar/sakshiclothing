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
        if (newProgress < 100) {
            progressBar.visibility = View.VISIBLE
            progressBar.progress = newProgress
        } else {
            progressBar.visibility = View.GONE
        }
    }

    override fun onShowFileChooser(
        webView: WebView?,
        filePathCallback: ValueCallback<Array<Uri>>?,
        fileChooserParams: FileChooserParams?
    ): Boolean {
        return onFileChooseCallback(filePathCallback, fileChooserParams)
    }

    override fun onCreateWindow(
        view: WebView?,
        isDialog: Boolean,
        isUserGesture: Boolean,
        resultMsg: Message?
    ): Boolean {
        val transport = resultMsg?.obj as? WebView.WebViewTransport ?: return false
        transport.webView = view
        resultMsg.sendToTarget()
        return true
    }
}
