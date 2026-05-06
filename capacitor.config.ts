import type { CapacitorConfig } from "@capacitor/cli";

/**
 * Capacitor wraps the web build (`webDir`) into native Android/iOS shells.
 *
 * Notes for this project:
 * - `webDir` points at Vite's `dist/` output. Run `npm run build:native` (or
 *   `npm run build` then `npx cap sync`) before opening Android Studio/Xcode.
 * - `appId` is a placeholder. **Change it before submitting to a store** — the
 *   identifier is permanent for the App Store / Google Play listing.
 * - `androidScheme: "https"` is the Capacitor 7 default and matches the
 *   recommended WebView origin (`https://localhost`). The backend's
 *   `CORS_ORIGIN` allowlist must include that origin (see
 *   `oldwhale-backend/.env.example`).
 * - `server.cleartext` is enabled to permit `http://` calls to a LAN dev API
 *   from a real device or emulator. Production builds should target HTTPS.
 */
const config: CapacitorConfig = {
  appId: "com.oldwhale.app",
  appName: "OldWhale",
  webDir: "dist",
  server: {
    androidScheme: "https",
    cleartext: true,
  },
  ios: {
    contentInset: "always",
  },
};

export default config;
