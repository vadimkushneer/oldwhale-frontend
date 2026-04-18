import { test, expect } from "@playwright/test";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  gotoReferenceOnboard,
  gotoReferenceLogin,
  gotoReferenceEditor,
  type ReferenceEditorMode,
} from "./helpers/driveReference";

/**
 * Reference-truth capture pipeline.
 *
 * Loads public/reference.html (served at http://127.0.0.1:4173/reference.html
 * by the same Vite preview server that hosts the React app) and writes
 * full-page PNGs directly into the routes.spec.ts-snapshots folder, so those
 * files become the new `toHaveScreenshot` baselines consumed by
 * e2e/visual/routes.spec.ts.
 *
 * Gated on `CAPTURE_REFERENCE=1` so regular `npm run test:e2e` runs stay
 * deterministic and do not overwrite baselines.
 *
 * Usage:
 *   CAPTURE_REFERENCE=1 npm run test:e2e -- visual/reference.capture.spec.ts
 *   CAPTURE_REFERENCE=1 npm run test:e2e -- visual/reference.capture.spec.ts -g onboarding
 */

const CAPTURE = process.env.CAPTURE_REFERENCE === "1";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SNAPSHOTS_DIR = path.join(__dirname, "routes.spec.ts-snapshots");

/**
 * Match Playwright's snapshot naming convention so the produced PNGs are
 * picked up as baselines by routes.spec.ts without any further rename.
 * Darwin and linux keep separate baselines because font rendering and
 * anti-aliasing differ between the two platforms.
 */
function baselinePath(name: string): string {
  const osSuffix = process.platform === "darwin" ? "darwin" : "linux";
  return path.join(SNAPSHOTS_DIR, `${name}-chromium-${osSuffix}.png`);
}

const screenshotOpts = {
  fullPage: true as const,
  animations: "disabled" as const,
  scale: "css" as const,
};

const EDITOR_MODE_BASELINES: Record<ReferenceEditorMode, string> = {
  note: "editor-guest",
  film: "editor-film",
  play: "editor-play",
  media: "editor-media",
};

test.describe("visual / capture from reference.html", () => {
  test.skip(
    !CAPTURE,
    "Set CAPTURE_REFERENCE=1 to regenerate baselines from reference.html",
  );

  test("onboarding", async ({ page }) => {
    await gotoReferenceOnboard(page);
    await page.screenshot({ ...screenshotOpts, path: baselinePath("onboarding") });
    expect(true).toBe(true);
  });

  test("login", async ({ page }) => {
    await gotoReferenceLogin(page);
    await page.screenshot({ ...screenshotOpts, path: baselinePath("login") });
    expect(true).toBe(true);
  });

  for (const mode of Object.keys(EDITOR_MODE_BASELINES) as ReferenceEditorMode[]) {
    const baselineName = EDITOR_MODE_BASELINES[mode];
    test(`editor ${mode} (${baselineName})`, async ({ page }) => {
      await gotoReferenceEditor(page, mode);
      await page.screenshot({ ...screenshotOpts, path: baselinePath(baselineName) });
      expect(true).toBe(true);
    });
  }
});
