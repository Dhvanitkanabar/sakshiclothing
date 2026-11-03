# Sakshi Clothing — Android Mobile Applications

Welcome to the Android Studio codebase for **Sakshi Clothing**. This repository provides the complete mobile conversion for both the **Customer Shopping Experience** and the **Admin Atelier Management Dashboard**.

---

## 1. Project Structure

```
android/
├── app-customer/                   # Sakshi Clothing Customer Shopping App
│   ├── src/main/java/store/sakshiclothing/customer/
│   │   ├── MainActivity.kt         # Container with hardware acceleration & back navigation
│   │   ├── WebAppInterface.kt     # Native JS Bridge (Haptics, Sharing, WhatsApp Concierge)
│   │   └── FileUploadChromeClient.kt # File picker & Razorpay window popup handling
│   └── src/main/AndroidManifest.xml
│
├── app-admin/                      # Sakshi Atelier Admin Management App
│   ├── src/main/java/store/sakshiclothing/admin/
│   │   ├── MainActivity.kt         # Admin dashboard with DownloadManager for reports/PDFs
│   │   ├── AdminBridge.kt          # Native JS Bridge for invoice sharing & haptic feedback
│   │   └── AdminChromeClient.kt    # Multi-file camera & gallery picker for product uploads
│   └── src/main/AndroidManifest.xml
│
├── dist-apks/                      # Ready-to-install compiled Android APKs
│   ├── SakshiClothing-Customer-v1.0.0.apk
│   └── SakshiClothing-Admin-v1.0.0.apk
│
├── build.gradle.kts                # Top-level Gradle configuration
├── settings.gradle.kts             # Subproject declarations
├── local.properties                # Android SDK directory mapping
└── gradlew.bat                     # Windows Gradle wrapper
```

---

## 2. Opening in Android Studio

1. Launch Android Studio (installed at `D:\android\bin\studio64.exe`).
2. Select **File ➔ Open...**.
3. Navigate to and select the `android` folder:
   `c:\Users\dhvan\Desktop\sakshiclothing\android`
4. Android Studio will automatically recognize Gradle and sync both `:app-customer` and `:app-admin`.

---

## 3. Running & Testing on Devices

### Using Android Studio
- In the top toolbar run configuration dropdown, select either:
  - **`app-customer`** to run the customer shopping experience.
  - **`app-admin`** to run the admin management dashboard.
- Select your connected Android phone (via USB/Wi-Fi with USB Debugging enabled) or an Android Virtual Device (AVD).
- Click the green **Run (Shift + F10)** button.

### Using Command Line (PowerShell)
```powershell
cd c:\Users\dhvan\Desktop\sakshiclothing\android
$env:JAVA_HOME = "D:\android\jbr"

# Build both Debug APKs:
.\gradlew.bat assembleDebug

# Install Customer App directly to connected device:
.\gradlew.bat :app-customer:installDebug

# Install Admin App directly to connected device:
.\gradlew.bat :app-admin:installDebug
```

---

## 4. Key Mobile Native Integrations

1. **Seamless Razorpay Payment Handling**:
   - `WebChromeClient.onCreateWindow` intercepts Razorpay popup frames and loads them smoothly without blank screens.
   - Deep-linking & URL interceptors route `upi://`, `phonepe://`, `paytmmp://`, and `gpay://` to native banking apps.
2. **Camera & Gallery Garment Uploader**:
   - `FileUploadChromeClient` / `AdminChromeClient` bridges the HTML `<input type="file" multiple>` with Android's native system photo picker and camera intent.
3. **Download Manager for Invoices & CSV Reports**:
   - Admin downloads (Tax Invoices, Shipping Labels, Order CSV, Inventory CSV) route through Android's system `DownloadManager` with notification tray status.
4. **Offline Fallback Screen**:
   - If network connectivity is lost, displays an atelier-styled offline recovery screen with a 1-tap "Retry Connection" button.
5. **Hardware & Gesture Back Navigation**:
   - Integrated with Android's `OnBackPressedDispatcher` so swiping or pressing Back navigates browsing history without exiting the app.

---

## 5. Generating Release APKs / Play Store AAB

To generate signed production bundles:
```powershell
cd c:\Users\dhvan\Desktop\sakshiclothing\android
$env:JAVA_HOME = "D:\android\jbr"
.\gradlew.bat bundleRelease
```
The output AAB files will be generated in `app-customer/build/outputs/bundle/release/` ready for upload to Google Play Console.
