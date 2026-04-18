import { expect, type Page } from "@playwright/test";

/**
 * Helpers for driving the in-memory screen state of the standalone
 * reference.html (served at /reference.html via Vite's public/ directory).
 *
 * reference.html has no router; its App component swaps between
 * screen === "onboard" | "login" | "editor". We navigate between them by
 * interacting with the visible UI (clicking the wheel button etc.) rather
 * than mutating React state, so the captured screenshots match what a real
 * user would see after those interactions settle.
 *
 * Each helper waits for a stable per-screen probe before returning so
 * callers can screenshot immediately without flake.
 */

const REFERENCE_URL = "/reference.html";

/**
 * Selector that is only present once the onboarding wheel has mounted and
 * Babel has finished transforming the inline <script type="text/babel">.
 * Text matches the hint line in reference.html: "КРУТИ ДЛЯ ВЫБОРА".
 */
const ONBOARD_PROBE = "text=КРУТИ ДЛЯ ВЫБОРА";

/** Login screen mounts the "ВОЙТИ" tab button. */
const LOGIN_PROBE_RU = "text=ВОЙТИ";

/**
 * Editor screen probe. "ПОПОЛНИТЬ" is the credits top-up button rendered
 * in the left-sidebar credits block of the editor for every mode (film /
 * play / note / media) and does NOT appear on the onboarding or login
 * screens, so it cleanly disambiguates the editor from its loading-state
 * ancestors. The final reference replaced the previous "МОИ ПРОЕКТЫ" text
 * button (which used to be the probe) with an icon-only tooltip-anchored
 * button, which is why the probe moved.
 */
const EDITOR_PROBE = "text=ПОПОЛНИТЬ";

/** Supported modes. "short" exists in the bundle but is not part of the baseline matrix. */
export type ReferenceEditorMode = "note" | "film" | "play" | "media";

/**
 * Position of each mode on the onboarding wheel. active index 0..4, rendered
 * as the "01".."05" labels. note is the default active item (no click needed).
 */
const WHEEL_POSITION_LABEL: Record<ReferenceEditorMode, string> = {
  note: "01",
  film: "02",
  play: "03",
  media: "05",
};

/**
 * Clear any persisted onboarding choice before loading reference.html so
 * the app always boots on screen === "onboard".
 */
async function bootClean(page: Page) {
  await page.addInitScript(() => {
    try {
      localStorage.clear();
    } catch {
      /* ignore */
    }
  });
  await page.goto(REFERENCE_URL);
  await page.waitForLoadState("networkidle").catch(() => undefined);
  await expect(page.locator(ONBOARD_PROBE)).toBeVisible({ timeout: 20_000 });
}

/**
 * Land on the onboarding screen and wait for the wheel to render.
 */
export async function gotoReferenceOnboard(page: Page): Promise<void> {
  await bootClean(page);
}

/**
 * Navigate from onboard to the login screen by picking a non-note profile.
 * reference.html's App routes any selection whose mode !== "note" through
 * Login before landing on the editor.
 *
 * Onboarding defaults to active === 0 (note / "Блокнот") so clicking НАЧАТЬ
 * would jump straight to the editor. We advance the wheel by one step via
 * the visible "02" digit (which is rendered by `Onboarding`'s wheel and is
 * clickable via `setActive(i)`) so the active item becomes "Сценарий"
 * (film), whose НАЧАТЬ routes to login.
 */
export async function gotoReferenceLogin(page: Page): Promise<void> {
  await bootClean(page);
  await page.locator("text=02").first().click();
  await expect(
    page.getByText("Сценарий", { exact: true }),
  ).toBeVisible({ timeout: 5_000 });
  await page.getByRole("button", { name: /НАЧАТЬ/ }).first().click();
  await expect(page.locator(LOGIN_PROBE_RU).first()).toBeVisible({ timeout: 20_000 });
  await page.waitForLoadState("networkidle").catch(() => undefined);
}

/**
 * Land on the editor screen in the given mode.
 *
 * - note is a guest-accessible path: a single НАЧАТЬ click from onboarding.
 * - film / play / media go through the login form. reference.html's Login
 *   accepts any non-empty login + password and resolves after a 1.6s
 *   timeout (the unpatched stub), so any credentials work.
 */
export async function gotoReferenceEditor(
  page: Page,
  mode: ReferenceEditorMode,
): Promise<void> {
  await bootClean(page);

  if (mode !== "note") {
    const label = WHEEL_POSITION_LABEL[mode];
    await page.locator(`text=${label}`).first().click();
  }

  await page.getByRole("button", { name: /НАЧАТЬ/ }).first().click();

  if (mode !== "note") {
    await expect(page.locator(LOGIN_PROBE_RU).first()).toBeVisible({ timeout: 20_000 });
    await page.getByPlaceholder("логин").fill("e2e-user");
    await page.getByPlaceholder("пароль").fill("e2e-pass");
    await page.getByPlaceholder("пароль").press("Enter");
  }

  await expect(page.locator(EDITOR_PROBE).first()).toBeVisible({ timeout: 30_000 });
  await page.waitForLoadState("networkidle").catch(() => undefined);
}

/**
 * Back-compat shim for callers that only care about the note / guest path.
 */
export async function gotoReferenceEditorNote(page: Page): Promise<void> {
  await gotoReferenceEditor(page, "note");
}
