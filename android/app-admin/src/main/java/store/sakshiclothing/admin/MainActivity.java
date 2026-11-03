package store.sakshiclothing.admin;

import android.annotation.SuppressLint;
import android.app.DownloadManager;
import android.content.Context;
import android.content.Intent;
import android.graphics.Bitmap;
import android.net.ConnectivityManager;
import android.net.Network;
import android.net.NetworkCapabilities;
import android.net.NetworkRequest;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.os.Environment;
import android.util.Log;
import android.view.View;
import android.webkit.CookieManager;
import android.webkit.URLUtil;
import android.webkit.ValueCallback;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceError;
import android.webkit.WebResourceRequest;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.Toast;

import androidx.activity.OnBackPressedCallback;
import androidx.activity.result.ActivityResultLauncher;
import androidx.activity.result.contract.ActivityResultContracts;
import androidx.appcompat.app.AppCompatActivity;

import store.sakshiclothing.admin.databinding.ActivityMainBinding;

/**
 * Sakshi Clothing Admin Atelier Android Application
 * Native enterprise dashboard container with persistent cookie synchronization,
 * DownloadManager for tax invoices & CSV exports, and multi-image garment uploader.
 */
public class MainActivity extends AppCompatActivity {

    private static final String TAG = "SakshiAdminAtelier";

    private ActivityMainBinding binding;
    private ValueCallback<Uri[]> fileUploadCallback;
    private ActivityResultLauncher<Intent> filePickerLauncher;
    private ConnectivityManager connectivityManager;
    private ConnectivityManager.NetworkCallback networkCallback;
    private boolean isNetworkCallbackRegistered = false;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        // Install uncaught exception safeguard
        final Thread.UncaughtExceptionHandler defaultHandler = Thread.getDefaultUncaughtExceptionHandler();
        Thread.setDefaultUncaughtExceptionHandler((thread, throwable) -> {
            Log.e(TAG, "Uncaught exception in " + thread.getName(), throwable);
            if (defaultHandler != null) {
                defaultHandler.uncaughtException(thread, throwable);
            }
        });

        try {
            binding = ActivityMainBinding.inflate(getLayoutInflater());
            setContentView(binding.getRoot());

            initFilePicker();
            setupHardwareBackHandler();
            setupSwipeRefresh();
            setupOfflineRetry();
            setupNetworkObserver();
            setupWebView();

            String targetUrl = getIntent() != null && getIntent().getDataString() != null
                    ? getIntent().getDataString()
                    : getString(R.string.admin_dashboard_url);
            loadAdminUrl(targetUrl);
        } catch (Throwable t) {
            Log.e(TAG, "Fatal error during MainActivity onCreate", t);
            showFatalErrorView();
        }
    }

    private void initFilePicker() {
        filePickerLauncher = registerForActivityResult(
                new ActivityResultContracts.StartActivityForResult(),
                result -> {
                    try {
                        if (result.getResultCode() == RESULT_OK && result.getData() != null) {
                            Uri[] results = WebChromeClient.FileChooserParams.parseResult(result.getResultCode(), result.getData());
                            if (fileUploadCallback != null) {
                                fileUploadCallback.onReceiveValue(results);
                            }
                        } else {
                            if (fileUploadCallback != null) {
                                fileUploadCallback.onReceiveValue(null);
                            }
                        }
                    } catch (Throwable t) {
                        Log.e(TAG, "File picker result handling error", t);
                        if (fileUploadCallback != null) {
                            fileUploadCallback.onReceiveValue(null);
                        }
                    } finally {
                        fileUploadCallback = null;
                    }
                }
        );
    }

    @Override
    protected void onResume() {
        super.onResume();
        safeFlushCookies();
    }

    @Override
    protected void onPause() {
        super.onPause();
        safeFlushCookies();
    }

    @Override
    protected void onStop() {
        super.onStop();
        safeFlushCookies();
    }

    @Override
    protected void onDestroy() {
        super.onDestroy();
        unregisterNetworkObserver();
    }

    private void safeFlushCookies() {
        try {
            CookieManager.getInstance().flush();
        } catch (Throwable t) {
            Log.w(TAG, "CookieManager.flush non-fatal error: " + t.getMessage());
        }
    }

    private void loadAdminUrl(String url) {
        try {
            binding.progressBar.setVisibility(View.VISIBLE);
            binding.webView.loadUrl(url);
        } catch (Throwable t) {
            Log.e(TAG, "Failed to load URL: " + url, t);
            showOfflineView();
        }
    }

    private void setupHardwareBackHandler() {
        getOnBackPressedDispatcher().addCallback(this, new OnBackPressedCallback(true) {
            @Override
            public void handleOnBackPressed() {
                try {
                    if (binding.webView.canGoBack()) {
                        binding.webView.goBack();
                    } else {
                        setEnabled(false);
                        getOnBackPressedDispatcher().onBackPressed();
                    }
                } catch (Throwable t) {
                    setEnabled(false);
                    getOnBackPressedDispatcher().onBackPressed();
                }
            }
        });
    }

    private void setupSwipeRefresh() {
        try {
            binding.swipeRefreshLayout.setColorSchemeResources(
                    R.color.admin_amber,
                    R.color.admin_slate_dark
            );
            binding.swipeRefreshLayout.setOnRefreshListener(() -> {
                try {
                    binding.webView.reload();
                } catch (Throwable t) {
                    binding.swipeRefreshLayout.setRefreshing(false);
                }
            });

            binding.webView.getViewTreeObserver().addOnScrollChangedListener(() -> {
                try {
                    binding.swipeRefreshLayout.setEnabled(binding.webView.getScrollY() == 0);
                } catch (Throwable ignored) {}
            });
        } catch (Throwable t) {
            Log.w(TAG, "SwipeRefresh setup non-fatal error: " + t.getMessage());
        }
    }

    private void setupOfflineRetry() {
        binding.btnRetry.setOnClickListener(v -> {
            binding.offlineContainer.setVisibility(View.GONE);
            binding.webView.setVisibility(View.VISIBLE);
            try {
                binding.webView.reload();
            } catch (Throwable t) {
                String targetUrl = getIntent() != null && getIntent().getDataString() != null
                        ? getIntent().getDataString()
                        : getString(R.string.admin_dashboard_url);
                loadAdminUrl(targetUrl);
            }
        });
    }

    private void showOfflineView() {
        try {
            binding.progressBar.setVisibility(View.GONE);
            binding.swipeRefreshLayout.setRefreshing(false);
            binding.webView.setVisibility(View.GONE);
            binding.offlineContainer.setVisibility(View.VISIBLE);
        } catch (Throwable ignored) {}
    }

    private void showFatalErrorView() {
        try {
            if (binding != null) {
                binding.progressBar.setVisibility(View.GONE);
                binding.webView.setVisibility(View.GONE);
                binding.offlineContainer.setVisibility(View.VISIBLE);
            }
        } catch (Throwable ignored) {}
    }

    private void setupNetworkObserver() {
        try {
            connectivityManager = (ConnectivityManager) getSystemService(Context.CONNECTIVITY_SERVICE);
            if (connectivityManager == null) return;

            networkCallback = new ConnectivityManager.NetworkCallback() {
                @Override
                public void onAvailable(Network network) {
                    runOnUiThread(() -> {
                        try {
                            if (binding.offlineContainer.getVisibility() == View.VISIBLE) {
                                binding.offlineContainer.setVisibility(View.GONE);
                                binding.webView.setVisibility(View.VISIBLE);
                                binding.webView.reload();
                            }
                        } catch (Throwable t) {
                            Log.w(TAG, "Network reload error: " + t.getMessage());
                        }
                    });
                }
            };

            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.N) {
                connectivityManager.registerDefaultNetworkCallback(networkCallback);
                isNetworkCallbackRegistered = true;
            } else {
                NetworkRequest request = new NetworkRequest.Builder()
                        .addCapability(NetworkCapabilities.NET_CAPABILITY_INTERNET)
                        .build();
                connectivityManager.registerNetworkCallback(request, networkCallback);
                isNetworkCallbackRegistered = true;
            }
        } catch (Throwable t) {
            Log.w(TAG, "NetworkCallback registration non-fatal error: " + t.getMessage());
            isNetworkCallbackRegistered = false;
        }
    }

    private void unregisterNetworkObserver() {
        if (isNetworkCallbackRegistered && networkCallback != null && connectivityManager != null) {
            try {
                connectivityManager.unregisterNetworkCallback(networkCallback);
            } catch (Throwable t) {
                Log.w(TAG, "NetworkCallback unregister error: " + t.getMessage());
            } finally {
                isNetworkCallbackRegistered = false;
                networkCallback = null;
            }
        }
    }

    @SuppressLint("SetJavaScriptEnabled")
    private void setupWebView() {
        WebView webView = binding.webView;

        // 1. Safe Cookie & Session Persistence
        try {
            CookieManager cookieManager = CookieManager.getInstance();
            cookieManager.setAcceptCookie(true);
            cookieManager.setAcceptThirdPartyCookies(webView, true);
        } catch (Throwable t) {
            Log.w(TAG, "CookieManager init warning: " + t.getMessage());
        }

        // 2. Safe WebSettings
        try {
            WebSettings settings = webView.getSettings();
            settings.setJavaScriptEnabled(true);
            settings.setDomStorageEnabled(true);
            settings.setDatabaseEnabled(true);
            settings.setLoadWithOverviewMode(true);
            settings.setUseWideViewPort(true);
            settings.setBuiltInZoomControls(false);
            settings.setDisplayZoomControls(false);
            settings.setSupportZoom(false);
            settings.setSupportMultipleWindows(false);
            settings.setJavaScriptCanOpenWindowsAutomatically(true);
            settings.setAllowFileAccess(true);
            settings.setAllowContentAccess(true);
            settings.setMixedContentMode(WebSettings.MIXED_CONTENT_ALWAYS_ALLOW);
            settings.setCacheMode(WebSettings.LOAD_DEFAULT);

            String currentUa = settings.getUserAgentString();
            if (currentUa == null) currentUa = "";
            if (!currentUa.contains("SakshiAdminAtelierAndroidApp")) {
                settings.setUserAgentString(currentUa + " SakshiAdminAtelierAndroidApp/1.0.0");
            }
        } catch (Throwable t) {
            Log.e(TAG, "WebSettings setup error", t);
        }

        // 3. Native JavaScript Interface Bridge
        try {
            webView.addJavascriptInterface(new AdminBridge(this), "SakshiAdminNative");
            webView.addJavascriptInterface(new AdminBridge(this), "Android");
        } catch (Throwable t) {
            Log.e(TAG, "JavaScript interface registration error", t);
        }

        // 4. DownloadListener for Reports CSV & Invoice PDFs
        webView.setDownloadListener((url, userAgent, contentDisposition, mimetype, contentLength) -> {
            try {
                String fileName = URLUtil.guessFileName(url, contentDisposition, mimetype);
                DownloadManager.Request request = new DownloadManager.Request(Uri.parse(url));
                request.setMimeType(mimetype);
                try {
                    request.addRequestHeader("cookie", CookieManager.getInstance().getCookie(url));
                } catch (Throwable ignored) {}
                request.addRequestHeader("User-Agent", userAgent);
                request.setDescription("Downloading file from Sakshi Admin Atelier...");
                request.setTitle(fileName);
                request.setNotificationVisibility(DownloadManager.Request.VISIBILITY_VISIBLE_NOTIFY_COMPLETED);
                request.setDestinationInExternalPublicDir(Environment.DIRECTORY_DOWNLOADS, fileName);

                DownloadManager dm = (DownloadManager) getSystemService(Context.DOWNLOAD_SERVICE);
                if (dm != null) {
                    dm.enqueue(request);
                    Toast.makeText(MainActivity.this, "Downloading file...", Toast.LENGTH_SHORT).show();
                }
            } catch (Throwable t) {
                Log.w(TAG, "DownloadManager fallback to ACTION_VIEW", t);
                try {
                    Intent intent = new Intent(Intent.ACTION_VIEW, Uri.parse(url));
                    intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                    startActivity(intent);
                } catch (Throwable e) {
                    Toast.makeText(MainActivity.this, "Unable to process download", Toast.LENGTH_SHORT).show();
                }
            }
        });

        // 5. WebChromeClient for Product Image Uploads
        webView.setWebChromeClient(new AdminChromeClient(
                binding.progressBar,
                (callback, params) -> {
                    fileUploadCallback = callback;
                    Intent intent = params != null ? params.createIntent() : null;
                    if (intent == null) {
                        intent = new Intent(Intent.ACTION_GET_CONTENT);
                        intent.setType("image/*");
                        intent.putExtra(Intent.EXTRA_ALLOW_MULTIPLE, true);
                    }
                    try {
                        filePickerLauncher.launch(intent);
                        return true;
                    } catch (Throwable e) {
                        Log.e(TAG, "FilePicker launch error", e);
                        if (fileUploadCallback != null) {
                            fileUploadCallback.onReceiveValue(null);
                            fileUploadCallback = null;
                        }
                        return false;
                    }
                }
        ));

        // 6. WebViewClient with robust error reporting
        webView.setWebViewClient(new WebViewClient() {
            @Override
            public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
                if (request == null || request.getUrl() == null) return false;
                String url = request.getUrl().toString();

                if (url.startsWith("tel:") || url.startsWith("mailto:") || url.startsWith("whatsapp:") || url.contains("wa.me")) {
                    try {
                        Intent intent = new Intent(Intent.ACTION_VIEW, Uri.parse(url));
                        intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                        startActivity(intent);
                        return true;
                    } catch (Throwable ignored) {
                        return false;
                    }
                }
                return false;
            }

            @Override
            public void onPageStarted(WebView view, String url, Bitmap favicon) {
                super.onPageStarted(view, url, favicon);
                binding.progressBar.setVisibility(View.VISIBLE);
            }

            @Override
            public void onPageFinished(WebView view, String url) {
                super.onPageFinished(view, url);
                binding.progressBar.setVisibility(View.GONE);
                binding.swipeRefreshLayout.setRefreshing(false);
                binding.offlineContainer.setVisibility(View.GONE);
                binding.webView.setVisibility(View.VISIBLE);
                safeFlushCookies();
            }

            @Override
            public void onReceivedError(WebView view, WebResourceRequest request, WebResourceError error) {
                super.onReceivedError(view, request, error);
                if (request != null && request.isForMainFrame()) {
                    showOfflineView();
                }
            }
        });
    }
}
