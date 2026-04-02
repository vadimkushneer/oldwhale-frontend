import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.oldwhale.app",
  appName: "Old Whale",
  webDir: "dist",
  server: {
    androidScheme: "https",
  },
};

export default config;
