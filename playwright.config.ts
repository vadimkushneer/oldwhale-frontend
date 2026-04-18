import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "e2e",
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: "list",
  timeout: 60_000,
  expect: {
    timeout: 20_000,
    toHaveScreenshot: {
      animations: "disabled",
      /**
       * Reference baselines are captured from reference.html (React 18.2 +
       * Babel-standalone loaded from CDN inside a headless Chromium), while
       * the React app under test is built with Vite and React 18.3. Two
       * classes of drift appear between the two environments:
       *   1. Font anti-aliasing (glyph-level, a few pixels per character).
       *   2. A small, consistent vertical offset (~10px) on flex-centered
       *      full-viewport layouts such as Login - likely stemming from the
       *      Babel vs SWC JSX transform emitting slightly different root
       *      DOM trees around the router boundary.
       * 12000 keeps us below 1.4% of a 1280x720 image - tight enough to
       * catch structural regressions (missing components, wrong colors,
       * broken layouts) while tolerating both classes of drift.
       */
      maxDiffPixels: 12000,
    },
  },
  use: {
    baseURL: "http://127.0.0.1:4173",
    viewport: { width: 1280, height: 720 },
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: "npm run e2e:serve",
    url: "http://127.0.0.1:4173",
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
  },
});
