import { Capacitor } from '@capacitor/core';
import { App } from '@capacitor/app';
import { StatusBar, Style } from '@capacitor/status-bar';
import { SplashScreen } from '@capacitor/splash-screen';
import { Keyboard } from '@capacitor/keyboard';
import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';
import { Share } from '@capacitor/share';
import { Network, ConnectionStatus } from '@capacitor/network';
import { PushNotifications, Token, ActionPerformed } from '@capacitor/push-notifications';
import { toast } from 'sonner';

// Registry of open modal dismiss callbacks (LIFO stack)
const modalDismissStack: Array<() => boolean> = [];

export const registerModalDismiss = (handler: () => boolean) => {
  modalDismissStack.push(handler);
  return () => {
    const idx = modalDismissStack.indexOf(handler);
    if (idx > -1) modalDismissStack.splice(idx, 1);
  };
};

class NativeAppService {
  private lastBackPressTime = 0;
  private isInitialized = false;

  public isNative(): boolean {
    return Capacitor.isNativePlatform();
  }

  public getPlatform(): string {
    return Capacitor.getPlatform();
  }

  /**
   * Initializes all native integrations on app mount
   */
  public async init(navigate: (path: string) => void) {
    if (this.isInitialized) return;
    this.isInitialized = true;

    if (!this.isNative()) {
      // Running on standard web browser
      return;
    }

    try {
      // 1. Status Bar Setup
      await StatusBar.setStyle({ style: Style.Dark });
      if (Capacitor.getPlatform() === 'android') {
        await StatusBar.setBackgroundColor({ color: '#FAF8F5' });
        await StatusBar.setOverlaysWebView({ overlay: false });
      }
    } catch (err) {
      console.warn('[Native] StatusBar config error:', err);
    }

    try {
      // 2. Hide Splash Screen cleanly once React has rendered
      await SplashScreen.hide({ fadeOutDuration: 300 });
    } catch (err) {
      console.warn('[Native] SplashScreen hide error:', err);
    }

    try {
      // 3. Keyboard Configuration
      await Keyboard.setAccessoryBarVisible({ isVisible: false });
      await Keyboard.setScroll({ isDisabled: false });
    } catch (err) {
      console.warn('[Native] Keyboard config error:', err);
    }

    // 4. Android Hardware Back Button Listener
    App.addListener('backButton', ({ canGoBack }) => {
      // Check if there is an active modal or drawer to close first
      if (modalDismissStack.length > 0) {
        const topHandler = modalDismissStack[modalDismissStack.length - 1];
        const handled = topHandler();
        if (handled) return;
      }

      const currentPath = window.location.pathname;
      if (currentPath === '/' || currentPath === '') {
        const now = Date.now();
        if (now - this.lastBackPressTime < 2000) {
          App.exitApp();
        } else {
          this.lastBackPressTime = now;
          toast('Press back again to exit Sakshi Clothing', { duration: 2000 });
        }
      } else {
        if (canGoBack) {
          window.history.back();
        } else {
          navigate('/');
        }
      }
    });

    // 5. Deep Linking Handler (App Links & Custom Scheme)
    App.addListener('appUrlOpen', (event) => {
      try {
        const url = new URL(event.url);
        // Extracts path from custom scheme: sakshiclothing://product/123 -> /product/123
        // Or https://sakshiclothing.store/product/123 -> /product/123
        let targetPath = url.pathname;
        if (url.host && url.host !== 'localhost' && url.host !== 'sakshiclothing.store') {
          targetPath = `/${url.host}${url.pathname}`;
        }
        if (url.search) targetPath += url.search;

        if (targetPath) {
          navigate(targetPath);
        }
      } catch (e) {
        console.warn('[Native] Deep link parse error:', e);
      }
    });

    // 6. Push Notifications Setup
    this.initPushNotifications(navigate);
  }

  /**
   * Initializes Firebase Cloud Messaging / APNs Push Notifications
   */
  private async initPushNotifications(navigate: (path: string) => void) {
    try {
      let permStatus = await PushNotifications.checkPermissions();

      if (permStatus.receive === 'prompt') {
        permStatus = await PushNotifications.requestPermissions();
      }

      if (permStatus.receive !== 'granted') {
        console.info('[Native] Push notification permission not granted');
        return;
      }

      await PushNotifications.register();

      // Token Registration Listener
      PushNotifications.addListener('registration', async (token: Token) => {
        try {
          const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';
          await fetch(`${apiUrl}/notifications/register-token`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({
              token: token.value,
              platform: Capacitor.getPlatform()
            })
          });
          console.info('[Native] Device push token registered successfully');
        } catch (regErr) {
          console.warn('[Native] Failed to send push token to server:', regErr);
        }
      });

      // Notification Received While App in Foreground
      PushNotifications.addListener('pushNotificationReceived', (notification) => {
        toast(notification.title || 'Sakshi Clothing', {
          description: notification.body,
          duration: 5000,
          action: notification.data?.orderId ? {
            label: 'View Order',
            onClick: () => navigate(`/track-order?orderId=${notification.data.orderId}`)
          } : undefined
        });
      });

      // User Tapped on Notification
      PushNotifications.addListener('pushNotificationActionPerformed', (action: ActionPerformed) => {
        const data = action.notification.data;
        if (data?.orderId) {
          navigate(`/track-order?orderId=${data.orderId}`);
        } else if (data?.productId) {
          navigate(`/product/${data.productId}`);
        }
      });
    } catch (pushErr) {
      console.warn('[Native] Push notification setup error:', pushErr);
    }
  }

  /**
   * Tactile Haptic Feedback
   */
  public async haptic(type: 'light' | 'medium' | 'heavy' | 'success' | 'error' = 'light') {
    if (!this.isNative()) return;
    try {
      if (type === 'light') {
        await Haptics.impact({ style: ImpactStyle.Light });
      } else if (type === 'medium') {
        await Haptics.impact({ style: ImpactStyle.Medium });
      } else if (type === 'heavy') {
        await Haptics.impact({ style: ImpactStyle.Heavy });
      } else if (type === 'success') {
        await Haptics.notification({ type: NotificationType.Success });
      } else if (type === 'error') {
        await Haptics.notification({ type: NotificationType.Error });
      }
    } catch {}
  }

  /**
   * Native Share Sheet with Fallbacks
   */
  public async share(options: { title: string; text?: string; url?: string; dialogTitle?: string }) {
    if (this.isNative()) {
      try {
        await Share.share(options);
        return true;
      } catch (e: any) {
        if (e.message?.includes('canceled') || e.message?.includes('cancelled')) return false;
      }
    }

    if (navigator.share) {
      try {
        await navigator.share(options);
        return true;
      } catch (err: any) {
        if (err.name === 'AbortError') return false;
      }
    }

    // Fallback: Copy link to clipboard
    if (options.url) {
      await navigator.clipboard.writeText(options.url);
      toast.success('Link copied to clipboard');
      return true;
    }
    return false;
  }

  /**
   * Monitor Network Connectivity
   */
  public onNetworkChange(callback: (status: ConnectionStatus) => void) {
    if (!this.isNative()) {
      const handleOnline = () => callback({ connected: true, connectionType: 'wifi' });
      const handleOffline = () => callback({ connected: false, connectionType: 'none' });
      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);
      return () => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
      };
    }

    const listener = Network.addListener('networkStatusChange', callback);
    return () => {
      listener.then(l => l.remove());
    };
  }

  public async getNetworkStatus(): Promise<ConnectionStatus> {
    if (!this.isNative()) {
      return { connected: navigator.onLine, connectionType: 'unknown' };
    }
    return await Network.getStatus();
  }
}

export const nativeApp = new NativeAppService();
export default nativeApp;
