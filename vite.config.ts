import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const raw = env.VITE_BASE_PATH?.trim();
  const base = raw && raw.length > 0 ? raw : "/";
  return {
    plugins: [react()],
    base,
    server: {
      host: "0.0.0.0",
      port: 5173,
      watch: process.env.DOCKER === "1" ? { usePolling: true } : undefined,
    },
  };
});
