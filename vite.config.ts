import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const raw = env.VITE_BASE_PATH?.trim();
  const base = raw && raw.length > 0 ? raw : "/";
  const pwaDisabled = env.VITE_PWA_DISABLED === "1";

  let apiOriginPattern: RegExp | null = null;
  try {
    const apiUrl = env.VITE_API_URL?.trim();
    if (apiUrl) {
      const origin = new URL(apiUrl).origin;
      const escaped = origin.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      apiOriginPattern = new RegExp(`^${escaped}/`);
    }
  } catch {
    apiOriginPattern = null;
  }

  return {
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
    },
  };
});
