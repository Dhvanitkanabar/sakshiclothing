package store.sakshiclothing.admin

import android.annotation.SuppressLint
import android.app.DownloadManager
import android.content.Context
import android.content.Intent
import android.graphics.Bitmap
import android.net.ConnectivityManager
import android.net.Network
import android.net.NetworkCapabilities
import android.net.NetworkRequest
import android.net.Uri
import android.os.Build
import android.os.Bundle
import android.os.Environment
import android.util.Log
import android.view.View
import android.webkit.CookieManager
import android.webkit.URLUtil
import android.webkit.ValueCallback
import android.webkit.WebChromeClient
import android.webkit.WebResourceError
import android.webkit.WebResourceRequest
import android.webkit.WebSettings
import android.webkit.WebView
import android.webkit.WebViewClient
import android.widget.Toast
import androidx.activity.OnBackPressedCallback
import androidx.activity.result.contract.ActivityResultContracts
import androidx.appcompat.app.AppCompatActivity
import store.sakshiclothing.admin.databinding.ActivityMainBinding

/**
 * Sakshi Clothing Admin Atelier Android Application
 * Unified single-source-of-truth management container with persistent session synchronization,
 * DownloadManager for tax invoices & CSV exports, and multi-image garment uploader.
 */
class MainActivity : AppCompatActivity() {

    companion object {
        private const val TAG = "SakshiAdminAtelier"
    }

    private lateinit var binding: ActivityMainBinding
    private var fileUploadCallback: ValueCallback<Array<Uri>>? = null
    private var connectivityManager: ConnectivityManager? = null
    private var networkCallback: ConnectivityManager.NetworkCallback? = null
    private var isNetworkCallbackRegistered = false

    private val filePickerLauncher = registerForActivityResult(
        ActivityResultContracts.StartActivityForResult()
    ) { result ->
        try {
            if (result.resultCode == RESULT_OK) {
                val data = result.data
                val results = WebChromeClient.FileChooserParams.parseResult(result.resultCode, data)
                fileUploadCallback?.onReceiveValue(results)
            } else {
                fileUploadCallback?.onReceiveValue(null)
            }
        } catch (t: Throwable) {
            Log.e(TAG, "File picker result handling error", t)
            fileUploadCallback?.onReceiveValue(null)
        }
        fileUploadCallback = null
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        // Install uncaught exception safeguard to prevent crash dialog loops
        val defaultHandler = Thread.getDefaultUncaughtExceptionHandler()
        Thread.setDefaultUncaughtExceptionHandler { thread, throwable ->
            Log.e(TAG, "Uncaught exception intercepted in $thread", throwable)
            defaultHandler?.uncaughtException(thread, throwable)
        }

        try {
            binding = ActivityMainBinding.inflate(layoutInflater)
            setContentView(binding.root)

            setupHardwareBackHandler()
            setupSwipeRefresh()
            setupOfflineRetry()
            setupNetworkObserver()
            setupWebView()

            val targetUrl = intent?.dataString ?: getString(R.string.admin_dashboard_url)
            loadAdminUrl(targetUrl)
        } catch (t: Throwable) {
            Log.e(TAG, "Fatal error during Activity onCreate", t)
            showFatalErrorView(t.localizedMessage ?: "Unknown initialization error")
        }
    }

    override fun onResume() {
        super.onResume()
        safeFlushCookies()
    }

    override fun onPause() {
        super.onPause()
        safeFlushCookies()
    }

    override fun onStop() {
        super.onStop()
        safeFlushCookies()
    }

    override fun onDestroy() {
        super.onDestroy()
        unregisterNetworkObserver()
    }

    private fun safeFlushCookies() {
        try {
            CookieManager.getInstance().flush()
        } catch (t: Throwable) {
            Log.w(TAG, "CookieManager.flush non-fatal error: ${t.message}")
        }
    }

    private fun loadAdminUrl(url: String) {
        try {
            binding.progressBar.visibility = View.VISIBLE
            binding.webView.loadUrl(url)
        } catch (t: Throwable) {
            Log.e(TAG, "Failed to load URL: $url", t)
            showOfflineView("Unable to connect to the Sakshi admin server. Tap below to retry.")
        }
    }

    private fun setupHardwareBackHandler() {
        onBackPressedDispatcher.addCallback(this, object : OnBackPressedCallback(true) {
            override fun handleOnBackPressed() {
                try {
                    if (binding.webView.canGoBack()) {
                        binding.webView.goBack()
                    } else {
                        isEnabled = false
                        onBackPressedDispatcher.onBackPressed()
                    }
                } catch (t: Throwable) {
                    isEnabled = false
                    onBackPressedDispatcher.onBackPressed()
                }
            }
        })
    }

    private fun setupSwipeRefresh() {
        try {
            binding.swipeRefreshLayout.setColorSchemeResources(
                R.color.admin_amber,
                R.color.admin_slate_dark
            )
            binding.swipeRefreshLayout.setOnRefreshListener {
                try {
                    binding.webView.reload()
                } catch (t: Throwable) {
                    binding.swipeRefreshLayout.isRefreshing = false
                }
            }

            binding.webView.viewTreeObserver.addOnScrollChangedListener {
                try {
                    binding.swipeRefreshLayout.isEnabled = (binding.webView.scrollY == 0)
                } catch (_: Throwable) {}
            }
        } catch (t: Throwable) {
            Log.w(TAG, "SwipeRefresh setup non-fatal error: ${t.message}")
        }
    }

    private fun setupOfflineRetry() {
        binding.btnRetry.setOnClickListener {
            binding.offlineContainer.visibility = View.GONE
            binding.webView.visibility = View.VISIBLE
            try {
                binding.webView.reload()
            } catch (t: Throwable) {
                val targetUrl = intent?.dataString ?: getString(R.string.admin_dashboard_url)
                loadAdminUrl(targetUrl)
            }
        }
    }

    private fun showOfflineView(message: String? = null) {
        binding.progressBar.visibility = View.GONE
        binding.swipeRefreshLayout.isRefreshing = false
        binding.webView.visibility = View.GONE
        binding.offlineContainer.visibility = View.VISIBLE
    }

    private fun showFatalErrorView(message: String) {
        try {
            binding.progressBar.visibility = View.GONE
            binding.webView.visibility = View.GONE
            binding.offlineContainer.visibility = View.VISIBLE
        } catch (_: Throwable) {}
    }

    private fun setupNetworkObserver() {
        try {
            connectivityManager = getSystemService(Context.CONNECTIVITY_SERVICE) as? ConnectivityManager
            if (connectivityManager == null) return

            networkCallback = object : ConnectivityManager.NetworkCallback() {
                override fun onAvailable(network: Network) {
                    runOnUiThread {
                        try {
                            if (binding.offlineContainer.visibility == View.VISIBLE) {
                                binding.offlineContainer.visibility = View.GONE
                                binding.webView.visibility = View.VISIBLE
                                binding.webView.reload()
                            }
                        } catch (t: Throwable) {
                            Log.w(TAG, "Network reload error: ${t.message}")
                        }
                    }
                }
            }

            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.N) {
                connectivityManager?.registerDefaultNetworkCallback(networkCallback as ConnectivityManager.NetworkCallback)
                isNetworkCallbackRegistered = true
            } else {
                val request = NetworkRequest.Builder()
                    .addCapability(NetworkCapabilities.NET_CAPABILITY_INTERNET)
                    .build()
                connectivityManager?.registerNetworkCallback(request, networkCallback as ConnectivityManager.NetworkCallback)
                isNetworkCallbackRegistered = true
            }
        } catch (t: Throwable) {
            Log.w(TAG, "NetworkCallback registration non-fatal error: ${t.message}")
            isNetworkCallbackRegistered = false
        }
    }

    private fun unregisterNetworkObserver() {
        if (isNetworkCallbackRegistered && networkCallback != null) {
            try {
                connectivityManager?.unregisterNetworkCallback(networkCallback!!)
            } catch (t: Throwable) {
                Log.w(TAG, "NetworkCallback unregister error: ${t.message}")
            } finally {
                isNetworkCallbackRegistered = false
                networkCallback = null
            }
        }
    }

    @SuppressLint("SetJavaScriptEnabled")
    private fun setupWebView() {
        val webView = binding.webView

        // 1. Safe Cookie & Session Persistence
        try {
            val cookieManager = CookieManager.getInstance()
            cookieManager.setAcceptCookie(true)
            cookieManager.setAcceptThirdPartyCookies(webView, true)
        } catch (t: Throwable) {
            Log.w(TAG, "CookieManager init warning: ${t.message}")
        }

        // 2. Safe WebSettings
        try {
            webView.settings.apply {
                javaScriptEnabled = true
                domStorageEnabled = true
                databaseEnabled = true
                loadWithOverviewMode = true
                useWideViewPort = true
                builtInZoomControls = false
                displayZoomControls = false
                setSupportZoom(false)
                // Disabling multiple windows prevents child-parent attachment crash
                setSupportMultipleWindows(false)
                javaScriptCanOpenWindowsAutomatically = true
                allowFileAccess = true
                allowContentAccess = true
                mixedContentMode = WebSettings.MIXED_CONTENT_ALWAYS_ALLOW
                cacheMode = WebSettings.LOAD_DEFAULT

                val currentUa = userAgentString ?: ""
                if (!currentUa.contains("SakshiAdminAtelierAndroidApp")) {
                    userAgentString = "$currentUa SakshiAdminAtelierAndroidApp/1.0.0"
                }
            }
        } catch (t: Throwable) {
            Log.e(TAG, "WebSettings setup error", t)
        }

        // 3. Native JavaScript Interface Bridge
        try {
            webView.addJavascriptInterface(AdminBridge(this), "SakshiAdminNative")
        } catch (t: Throwable) {
            Log.e(TAG, "JavaScript interface registration error", t)
        }

        // 4. DownloadListener for Reports CSV & Invoice PDFs
        webView.setDownloadListener { url, userAgent, contentDisposition, mimetype, _ ->
            try {
                val fileName = URLUtil.guessFileName(url, contentDisposition, mimetype)
                val request = DownloadManager.Request(Uri.parse(url)).apply {
                    setMimeType(mimetype)
                    try {
                        addRequestHeader("cookie", CookieManager.getInstance().getCookie(url))
                    } catch (_: Throwable) {}
                    addRequestHeader("User-Agent", userAgent)
                    setDescription("Downloading file from Sakshi Admin Atelier...")
                    setTitle(fileName)
                    setNotificationVisibility(DownloadManager.Request.VISIBILITY_VISIBLE_NOTIFY_COMPLETED)
                    setDestinationInExternalPublicDir(Environment.DIRECTORY_DOWNLOADS, fileName)
                }
                val dm = getSystemService(Context.DOWNLOAD_SERVICE) as DownloadManager
                dm.enqueue(request)
                Toast.makeText(this, "Downloading file...", Toast.LENGTH_SHORT).show()
            } catch (t: Throwable) {
                Log.w(TAG, "DownloadManager fallback to ACTION_VIEW", t)
                try {
                    val intent = Intent(Intent.ACTION_VIEW, Uri.parse(url)).apply {
                        addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
                    }
                    startActivity(intent)
                } catch (e: Throwable) {
                    Toast.makeText(this, "Unable to process download", Toast.LENGTH_SHORT).show()
                }
            }
        }

        // 5. WebChromeClient for Product Image Uploads
        webView.webChromeClient = AdminChromeClient(
            activity = this,
            progressBar = binding.progressBar
        ) { callback, params ->
            fileUploadCallback = callback
            val intent = params?.createIntent() ?: Intent(Intent.ACTION_GET_CONTENT).apply {
                type = "image/*"
                putExtra(Intent.EXTRA_ALLOW_MULTIPLE, true)
            }
            try {
                filePickerLauncher.launch(intent)
                true
            } catch (e: Throwable) {
                Log.e(TAG, "FilePicker launch error", e)
                fileUploadCallback?.onReceiveValue(null)
                fileUploadCallback = null
                false
            }
        }

        // 6. WebViewClient with robust error reporting
        webView.webViewClient = object : WebViewClient() {
            override fun shouldOverrideUrlLoading(view: WebView?, request: WebResourceRequest?): Boolean {
                val url = request?.url?.toString() ?: return false

                if (url.startsWith("tel:") || url.startsWith("mailto:") || url.startsWith("whatsapp://") || url.contains("wa.me")) {
                    return try {
                        val intent = Intent(Intent.ACTION_VIEW, Uri.parse(url)).apply {
                            addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
                        }
                        startActivity(intent)
                        true
                    } catch (e: Throwable) {
                        false
                    }
                }

                return false
            }

            override fun onPageStarted(view: WebView?, url: String?, favicon: Bitmap?) {
                super.onPageStarted(view, url, favicon)
                binding.progressBar.visibility = View.VISIBLE
            }

            override fun onPageFinished(view: WebView?, url: String?) {
                super.onPageFinished(view, url)
                binding.progressBar.visibility = View.GONE
                binding.swipeRefreshLayout.isRefreshing = false
                binding.offlineContainer.visibility = View.GONE
                binding.webView.visibility = View.VISIBLE
                safeFlushCookies()
            }

            override fun onReceivedError(view: WebView?, request: WebResourceRequest?, error: WebResourceError?) {
                super.onReceivedError(view, request, error)
                if (request?.isForMainFrame == true) {
                    showOfflineView()
                }
            }
        }
    }
}
