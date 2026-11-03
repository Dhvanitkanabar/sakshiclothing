package store.sakshiclothing.customer

import android.annotation.SuppressLint
import android.content.Intent
import android.graphics.Bitmap
import android.net.Uri
import android.os.Bundle
import android.view.View
import android.webkit.CookieManager
import android.webkit.ValueCallback
import android.webkit.WebChromeClient
import android.webkit.WebResourceError
import android.webkit.WebResourceRequest
import android.webkit.WebSettings
import android.webkit.WebView
import android.webkit.WebViewClient
import androidx.activity.OnBackPressedCallback
import androidx.activity.result.contract.ActivityResultContracts
import androidx.appcompat.app.AppCompatActivity
import store.sakshiclothing.customer.databinding.ActivityMainBinding

class MainActivity : AppCompatActivity() {

    private lateinit var binding: ActivityMainBinding
    private var fileUploadCallback: ValueCallback<Array<Uri>>? = null

    private val filePickerLauncher = registerForActivityResult(
        ActivityResultContracts.StartActivityForResult()
    ) { result ->
        if (result.resultCode == RESULT_OK) {
            val data = result.data
            val results = WebChromeClient.FileChooserParams.parseResult(result.resultCode, data)
            fileUploadCallback?.onReceiveValue(results)
        } else {
            fileUploadCallback?.onReceiveValue(null)
        }
        fileUploadCallback = null
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityMainBinding.inflate(layoutInflater)
        setContentView(binding.root)

        setupHardwareBackHandler()
        setupSwipeRefresh()
        setupOfflineRetry()
        setupWebView()

        // Load customer store or deep-link URI
        val targetUrl = intent?.dataString ?: getString(R.string.customer_store_url)
        binding.webView.loadUrl(targetUrl)
    }

    private fun setupHardwareBackHandler() {
        onBackPressedDispatcher.addCallback(this, object : OnBackPressedCallback(true) {
            override fun handleOnBackPressed() {
                if (binding.webView.canGoBack()) {
                    binding.webView.goBack()
                } else {
                    isEnabled = false
                    onBackPressedDispatcher.onBackPressed()
                }
            }
        })
    }

    private fun setupSwipeRefresh() {
        binding.swipeRefreshLayout.setColorSchemeResources(
            R.color.atelier_amber,
            R.color.atelier_dark
        )
        binding.swipeRefreshLayout.setOnRefreshListener {
            binding.webView.reload()
        }

        // Prevent swipe-refresh from triggering when user is scrolling downward inside PDP or category list
        binding.webView.viewTreeObserver.addOnScrollChangedListener {
            binding.swipeRefreshLayout.isEnabled = binding.webView.scrollY == 0
        }
    }

    private fun setupOfflineRetry() {
        binding.btnRetry.setOnClickListener {
            binding.offlineContainer.visibility = View.GONE
            binding.webView.visibility = View.VISIBLE
            binding.webView.reload()
        }
    }

    @SuppressLint("SetJavaScriptEnabled")
    private fun setupWebView() {
        val webView = binding.webView

        // 1. Cookie & Session Persistence
        val cookieManager = CookieManager.getInstance()
        cookieManager.setAcceptCookie(true)
        cookieManager.setAcceptThirdPartyCookies(webView, true)

        // 2. WebSettings
        webView.settings.apply {
            javaScriptEnabled = true
            domStorageEnabled = true
            databaseEnabled = true
            loadWithOverviewMode = true
            useWideViewPort = true
            builtInZoomControls = false
            displayZoomControls = false
            setSupportZoom(false)
            setSupportMultipleWindows(true)
            javaScriptCanOpenWindowsAutomatically = true
            allowFileAccess = true
            allowContentAccess = true
            mixedContentMode = WebSettings.MIXED_CONTENT_ALWAYS_ALLOW
            cacheMode = WebSettings.LOAD_DEFAULT
            userAgentString = "${userAgentString} SakshiClothingAndroidApp/1.0.0"
        }

        // 3. Native JavaScript Interface Bridge
        webView.addJavascriptInterface(WebAppInterface(this), "SakshiNativeApp")

        // 4. WebChromeClient for File Upload & Window Popups
        webView.webChromeClient = FileUploadChromeClient(
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
            } catch (e: Exception) {
                fileUploadCallback = null
                false
            }
        }

        // 5. WebViewClient for App Navigation, UPI, and WhatsApp Handlers
        webView.webViewClient = object : WebViewClient() {
            override fun shouldOverrideUrlLoading(view: WebView?, request: WebResourceRequest?): Boolean {
                val url = request?.url?.toString() ?: return false

                // Native WhatsApp Intent
                if (url.startsWith("whatsapp://") || url.contains("wa.me") || url.contains("api.whatsapp.com")) {
                    return try {
                        val intent = Intent(Intent.ACTION_VIEW, Uri.parse(url))
                        startActivity(intent)
                        true
                    } catch (e: Exception) {
                        false
                    }
                }

                // Native UPI & Payment Apps Intent (GPay, PhonePe, Paytm, BHIM)
                if (url.startsWith("upi://") || url.startsWith("phonepe://") || url.startsWith("paytmmp://") || url.startsWith("tez://")) {
                    return try {
                        val intent = Intent(Intent.ACTION_VIEW, Uri.parse(url))
                        startActivity(intent)
                        true
                    } catch (e: Exception) {
                        false
                    }
                }

                // Phone dialer & Email
                if (url.startsWith("tel:") || url.startsWith("mailto:")) {
                    return try {
                        val intent = Intent(Intent.ACTION_VIEW, Uri.parse(url))
                        startActivity(intent)
                        true
                    } catch (e: Exception) {
                        false
                    }
                }

                // Standard Web Navigation
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
            }

            override fun onReceivedError(view: WebView?, request: WebResourceRequest?, error: WebResourceError?) {
                super.onReceivedError(view, request, error)
                if (request?.isForMainFrame == true) {
                    binding.progressBar.visibility = View.GONE
                    binding.swipeRefreshLayout.isRefreshing = false
                    binding.webView.visibility = View.GONE
                    binding.offlineContainer.visibility = View.VISIBLE
                }
            }
        }
    }
}
