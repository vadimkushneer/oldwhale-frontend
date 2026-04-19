# Testing infrastructure

This document describes automated tests for **OldWhale frontend**: behavioral end-to-end (E2E) specs, visual regression (screenshot baselines per route), CI, and how to run or refresh them.

**Russian:** [TESTING.ru.md](./TESTING.ru.md)

---

## Stack and runtime

- **Runner:** [Playwright Test](https://playwright.dev/) (`@playwright/test`, pinned in `package.json`).
- **Config:** [`playwright.config.ts`](./playwright.config.ts) — `testDir: "e2e"`, Chromium only, `baseURL: http://127.0.0.1:4173`, `webServer` runs **`npm run e2e:serve`** (production build + Vite preview on port **4173**). You do **not** start `npm run dev` manually for tests.
- **API during tests:** The E2E build sets `VITE_API_URL=http://127.0.0.1:4173` so the SPA calls the same origin. Specs use **`page.route`** to mock JSON endpoints (`/api/me`, `/api/auth/register`, admin routes, etc.).

**One-time setup (per machine):** install browser binaries for the pinned Playwright version:

```bash
npx playwright install chromium
```

Run commands from the repository root (`oldwhale-frontend/`).

---

## 1) Behavioral E2E tests (user flows)

**Yes — there are E2E tests that exercise real UI flows** (clicks, fills, navigation), with the API mocked via `page.route`.

| Spec | What it covers |
|------|----------------|
| [`e2e/auth-registration.spec.ts`](./e2e/auth-registration.spec.ts) | Registration: success → redirect to `/editor` and `localStorage` token; API error → error text visible, stays on `/login`. |

There are no other `*.spec.ts` files beyond the registration spec and the visual suite (see below).

**Run registration E2E only:**

```bash
npm run test:e2e -- auth-registration.spec.ts
```

**Run a single test by title:**

```bash
npx playwright test -g "completes registration"
```

**Debug locally:** `trace: on-first-retry` is enabled in config. For interactive debugging:

```bash
npx playwright test --ui
```

---

## 2) Visual regression tests (route-by-route screenshots)

**Yes — there are tests that compare the app to PNG baselines route by route**, using Playwright’s `expect(page).toHaveScreenshot(...)`.

| Spec | What it covers |
|------|----------------|
| [`e2e/visual/routes.spec.ts`](./e2e/visual/routes.spec.ts) | Full-page screenshots for `/` (onboarding), `/login`, `/editor` (guest and authenticated modes: note / film / play / media), `/admin` (admin user and insufficient-rights). |
| [`e2e/visual/reference.capture.spec.ts`](./e2e/visual/reference.capture.spec.ts) | **Baseline regeneration only** (gated on `CAPTURE_REFERENCE=1`): drives [`public/reference.html`](./public/reference.html) and writes PNGs into the same snapshot folder `routes.spec.ts` uses. |

Baselines live under [`e2e/visual/routes.spec.ts-snapshots/`](./e2e/visual/routes.spec.ts-snapshots/) as `*-chromium-linux.png` and `*-chromium-darwin.png` (OS-specific). Comparison tolerance is set in `playwright.config.ts` (`expect.toHaveScreenshot.maxDiffPixels`, currently **18000**) to allow font/OS drift while catching layout and color regressions.

**Run visual tests only:**

```bash
npm run test:e2e -- visual/routes.spec.ts
```

**Run all Playwright tests** (behavioral + visual + capture spec skipped unless `CAPTURE_REFERENCE=1`):

```bash
npm run test:e2e
```

### Updating baselines after intentional UI changes

1. **Align with pixel truth in [`reference.html`](./reference.html)** (legacy standalone app): recapture from `reference.html`:

   ```bash
   npm run test:e2e:capture-reference
   # subset:
   npm run test:e2e:capture-reference -- -g onboarding
   ```

   (`CAPTURE_REFERENCE=1` is set by the `test:e2e:capture-reference` npm script.)

2. **Screens that do not come from `reference.html`** (e.g. admin): update snapshots from the current React render:

   ```bash
   npm run test:e2e:update -- visual/routes.spec.ts
   ```

Regenerate snapshots on the **same OS** you care about, or in **Linux CI** (e.g. `mcr.microsoft.com/playwright` as in [`.github/workflows/e2e.yml`](./.github/workflows/e2e.yml)) so `chromium-linux` PNGs match GitHub Actions. Refreshing only **darwin** locally can leave **linux** baselines failing in CI until updated from Linux or a matching environment.

---

## npm scripts (quick reference)

| Goal | Command |
|------|---------|
| All Playwright tests | `npm run test:e2e` |
| Visual tests only | `npm run test:e2e -- e2e/visual/routes.spec.ts` |
| Registration E2E only | `npm run test:e2e -- e2e/auth-registration.spec.ts` |
| Recapture baselines from `reference.html` | `npm run test:e2e:capture-reference` |
| Update visual snapshots from React | `npm run test:e2e:update -- e2e/visual/routes.spec.ts` |

---

## Continuous integration

[`.github/workflows/e2e.yml`](./.github/workflows/e2e.yml) runs `npm run test:e2e` with `CI=1` on pushes and pull requests targeting `main` (Playwright Jammy image).

---

## Troubleshooting

- **Port 4173 in use:** stop other preview servers or change the port consistently in `playwright.config.ts` and `package.json` (advanced).
- **First run is slow:** `e2e:serve` runs a full `npm run build` before preview.
- **Stale dependencies:** run `npm ci` in clean/CI-like environments before tests.
- **Service worker / PWA:** `npm run e2e:serve` builds with `VITE_PWA_DISABLED=1`, so no service worker is registered and no `manifest.webmanifest` is emitted during tests — visual baselines are never affected by PWA assets or update prompts. If you need to verify the PWA itself, build without that flag and serve `dist/` with any static server (e.g. `npx serve dist -p 4173`).
