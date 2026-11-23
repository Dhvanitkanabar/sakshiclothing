# Sakshi Clothing — Customer Mobile App (Deprecated Legacy WebView)

> [!WARNING]
> **DEPRECATED & REPLACED BY CAPACITOR NATIVE APP**
> This legacy Android WebView wrapper (`android/app-customer`) has been superseded by the modern **Capacitor Mobile Application** located in:
> [`frontend/customer/android/`](file:///c:/Users/dhvan/Desktop/sakshiclothing/frontend/customer/android)

---

## Why the Legacy WebView Wrapper was Replaced:

1. **Store Rejection Risks (Google Play & Apple App Store)**:
   - Google Play policy strictly rejects "web wrappers" lacking native functionality under the *Minimum Functionality* rule.
   - Apple App Store Guideline 4.2 requires apps to provide interactive native utility beyond a framed responsive website.
2. **Google OAuth WebView Blocking (`disallowed_useragent`)**:
   - Google blocks OAuth2 logins inside embedded WebViews. The legacy wrapper failed to support modern Google/Apple single sign-on flows.
   - Capacitor solves this by invoking system Custom Tabs via `@capacitor/browser` and returning tokens via secure deep link (`sakshiclothing://auth-callback`).
3. **Offline Boot & Asset Bundling**:
   - The legacy wrapper loaded remote URLs over network, resulting in blank error screens on slow or disconnected devices.
   - Capacitor bundles compiled production web assets locally (`https://localhost`), achieving instant offline boot, zero network latency on startup, and graceful offline recovery banners.
4. **Hardware & Plugin Integration**:
   - Replaced custom, unmaintained Kotlin bridge classes with audited, cross-platform Capacitor plugins (`@capacitor/push-notifications`, `@capacitor/haptics`, `@capacitor/status-bar`, `@capacitor/keyboard`, `@capacitor/network`, `@capacitor/share`, `@capacitor/app`).

---

## Active Mobile Application Codebase:
- **Android & iOS Capacitor Project**: [`frontend/customer`](file:///c:/Users/dhvan/Desktop/sakshiclothing/frontend/customer)
- **Android Studio Project Path**: [`frontend/customer/android`](file:///c:/Users/dhvan/Desktop/sakshiclothing/frontend/customer/android)
- **iOS Xcode Project Path**: [`frontend/customer/ios`](file:///c:/Users/dhvan/Desktop/sakshiclothing/frontend/customer/ios)
