import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const raw = env.VITE_BASE_PATH?.trim();
  const base = raw && raw.length > 0 ? raw : "/";
  const pwaDisabled = env.VITE_PWA_DISABLED === "1";
  const viteApiUrl = env.VITE_API_URL?.trim() ?? "";
  /** When `VITE_API_URL` is unset, the app uses same-origin `/api/...` and Vite must proxy to the Go server. */
  const devApiProxyTarget = (env.VITE_DEV_API_PROXY_TARGET ?? "http://127.0.0.1:8080").trim();

  let apiOriginPattern: RegExp | null = null;
  try {
    const apiUrl = viteApiUrl;
    if (apiUrl) {
      const origin = new URL(apiUrl).origin;
      const escaped = origin.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      apiOriginPattern = new RegExp(`^${escaped}/`);
    }
  } catch {
    apiOriginPattern = null;
  }

  return {
    /*
     * Pre-bundle Ionic so Vite's dev server doesn't trigger a full reload
     * the first time a route imports an Ionic component.
     */
    optimizeDeps: {
      include: ["@ionic/react", "ionicons/icons"],
    },
    plugins: [
      react(),
      VitePWA({
        disable: pwaDisabled,
        registerType: "autoUpdate",
        injectRegister: false,
        includeAssets: [
          "icons/favicon.ico",
          "icons/apple-touch-icon.png",
          "icons/pwa-192x192.png",
          "icons/pwa-512x512.png",
          "icons/pwa-maskable-512x512.png",
        ],
        manifest: {
          name: "OldWhale",
          short_name: "OldWhale",
          description: "OldWhale — редактор сценариев, заметок и медиа-проектов",
          lang: "ru",
          start_url: base,
          scope: base,
          id: base,
          display: "standalone",
          orientation: "any",
          background_color: "#1a1b2e",
          theme_color: "#1a1b2e",
          icons: [
            {
              src: `${base}icons/pwa-192x192.png`,
              sizes: "192x192",
              type: "image/png",
              purpose: "any",
            },
            {
              src: `${base}icons/pwa-512x512.png`,
              sizes: "512x512",
              type: "image/png",
              purpose: "any",
            },
            {
              src: `${base}icons/pwa-maskable-512x512.png`,
              sizes: "512x512",
              type: "image/png",
              purpose: "maskable",
            },
          ],
        },
        workbox: {
          /** Main bundle can exceed Workbox’s 2 MiB default after feature growth. */
          maximumFileSizeToCacheInBytes: 4 * 1024 * 1024,
          globPatterns: [
            "**/*.{js,css,html,ico,png,svg,webp,woff,woff2,json,webmanifest}",
          ],
          globIgnores: ["**/reference.html", "**/reference_legacy.html"],
          navigateFallback: `${base}index.html`,
          navigateFallbackDenylist: [/^\/api\//],
          cleanupOutdatedCaches: true,
          clientsClaim: true,
          skipWaiting: true,
          runtimeCaching: [
            ...(apiOriginPattern
              ? [
                  {
                    urlPattern: apiOriginPattern,
                    handler: "NetworkOnly" as const,
                    options: {
                      cacheName: "ow-api-network-only",
                    },
                  },
                ]
              : []),
            {
              urlPattern: /\.(?:png|jpg|jpeg|svg|webp|ico|gif|woff2?)$/i,
              handler: "CacheFirst",
              options: {
                cacheName: "ow-static-assets",
                expiration: {
                  maxEntries: 128,
                  maxAgeSeconds: 60 * 60 * 24 * 30,
                },
              },
            },
          ],
        },
        devOptions: {
          enabled: false,
        },
      }),
    ],
    base,
    server: {
      host: "0.0.0.0",
      port: 5173,
      watch: process.env.DOCKER === "1" ? { usePolling: true } : undefined,
      ...(viteApiUrl
        ? {}
        : {
            proxy: {
              "/api": {
                target: devApiProxyTarget,
                changeOrigin: true,
              },
            },
          }),
    },
  };
});
