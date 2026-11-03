package store.sakshiclothing.customer;

import android.net.Uri;
import android.os.Message;
import android.view.View;
import android.webkit.ValueCallback;
import android.webkit.WebChromeClient;
import android.webkit.WebView;
import android.widget.ProgressBar;

public class FileUploadChromeClient extends WebChromeClient {

    public interface FileChooserListener {
        boolean onChoose(ValueCallback<Uri[]> callback, FileChooserParams params);
    }

    private final ProgressBar progressBar;
    private final FileChooserListener fileChooserListener;

    public FileUploadChromeClient(ProgressBar progressBar, FileChooserListener fileChooserListener) {
        this.progressBar = progressBar;
        this.fileChooserListener = fileChooserListener;
    }

    @Override
    public void onProgressChanged(WebView view, int newProgress) {
        super.onProgressChanged(view, newProgress);
        try {
            if (progressBar != null) {
                if (newProgress < 100) {
                    progressBar.setVisibility(View.VISIBLE);
                    progressBar.setProgress(newProgress);
                } else {
                    progressBar.setVisibility(View.GONE);
                }
            }
        } catch (Throwable ignored) {}
    }

    @Override
    public boolean onShowFileChooser(WebView webView, ValueCallback<Uri[]> filePathCallback, FileChooserParams fileChooserParams) {
        if (fileChooserListener != null) {
            try {
                return fileChooserListener.onChoose(filePathCallback, fileChooserParams);
            } catch (Throwable t) {
                if (filePathCallback != null) {
                    filePathCallback.onReceiveValue(null);
                }
                return false;
            }
        }
        return false;
    }

    @Override
    public boolean onCreateWindow(WebView view, boolean isDialog, boolean isUserGesture, Message resultMsg) {
        // Prevent fatal Chromium window attachment crash by loading target URL into the current view
        try {
            if (view != null && view.getHandler() != null) {
                Message href = view.getHandler().obtainMessage();
                view.requestFocusNodeHref(href);
                String url = href.getData().getString("url");
                if (url != null && !url.trim().isEmpty()) {
                    view.loadUrl(url);
                }
            }
        } catch (Throwable ignored) {}
        return false;
    }
}
