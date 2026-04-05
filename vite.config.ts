import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { VitePWA } from "vite-plugin-pwa";
import path from "node:path";

/** Vite requires a trailing slash for non-root bases. */
function viteBase(): string {
  const raw = (process.env.VITE_BASE_PATH ?? "/").trim();
  if (raw === "" || raw === "/") return "/";
  return raw.endsWith("/") ? raw : `${raw}/`;
}

const base = viteBase();

export default defineConfig({
  base,
  plugins: [
    vue(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.svg"],
      manifest: {
        name: "Old Whale",
        short_name: "OldWhale",
        description: "Редактор историй",
        theme_color: "#1a1b2e",
        background_color: "#1a1b2e",
        display: "standalone",
        start_url: base,
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,svg,woff2}"],
      },
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
  server: {
    host: true,
    port: 5173,
    strictPort: false,
    hmr: {
      overlay: true,
    },
  },
});
