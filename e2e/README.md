# End-to-end and visual testing

Playwright drives the app against a **production build** served on `http://127.0.0.1:4173`. The build sets `VITE_API_URL=http://127.0.0.1:4173` so the SPA calls the same origin; tests use **`page.route`** to mock JSON APIs (`/api/me`, `/api/auth/register`, admin routes, etc.). See [`playwright.config.ts`](../playwright.config.ts).

**Prerequisite (once per machine):** install browser binaries for the pinned Playwright version:

```bash
npx playwright install chromium
```

From the repository root (`oldwhale-frontend/`).

---

## Visual regression tests

**What they are:** [`visual/routes.spec.ts`](visual/routes.spec.ts) captures full-page screenshots (`toHaveScreenshot`) for onboarding, login, guest editor, and admin screens. Baselines live under `visual/routes.spec.ts-snapshots/` as `*-chromium-linux.png` and `*-chromium-darwin.png` (OS-specific).

**How to run and verify**

```bash
npm run test:e2e -- visual/routes.spec.ts
```

Or run the whole suite (includes this file):

```bash
npm run test:e2e
```

- **Pass:** each screenshot matches its baseline within [`maxDiffPixels`](../playwright.config.ts) (400).
- **Fail:** Playwright reports pixel mismatch; on failure, screenshots are attached to the test output. Re-run after intentional UI changes only after updating baselines (below).

**How to update baselines after intentional UI changes**

```bash
npm run test:e2e:update -- visual/routes.spec.ts
```

(`test:e2e:update` is `playwright test --update-snapshots`.)

Regenerate snapshots on the **same OS** you care about, or run in CI/Linux (for example the `mcr.microsoft.com/playwright` image used in [`.github/workflows/e2e.yml`](../.github/workflows/e2e.yml)) so **`chromium-linux`** PNGs match what GitHub Actions uses. If you only refresh **darwin** snapshots locally, **linux** snapshots may still fail in CI until updated from Linux or a matching environment.

**CI:** `.github/workflows/e2e.yml` runs `npm run test:e2e` with `CI=1` on every push and pull request to `main`.

---

## E2E tests (behavioral)

**What they are:** assertion-based specs without screenshot baselines, for example [`auth-registration.spec.ts`](auth-registration.spec.ts) (registration success and API error paths).

**How to run and verify**

```bash
npm run test:e2e -- auth-registration.spec.ts
```

Or a single test by title:

```bash
npx playwright test -g "completes registration"
```

- **Pass:** assertions (URL, visible text, `localStorage`, mocked routes) succeed.
- **Fail:** read the listed assertion error; use `trace: on-first-retry` in config (traces on retry) or add `--debug` / UI mode for local investigation:

```bash
npx playwright test --ui
```

The **`webServer`** in Playwright config starts **`npm run e2e:serve`** (build + preview on port **4173**). You do not need a separate dev server.

---

## Quick reference

| Goal | Command |
|------|---------|
| All Playwright tests | `npm run test:e2e` |
| Visual tests only | `npm run test:e2e -- visual/` |
| Registration E2E only | `npm run test:e2e -- auth-registration.spec.ts` |
| Update visual snapshots | `npm run test:e2e:update -- visual/routes.spec.ts` |

---

## Troubleshooting

- **Port 4173 in use:** stop other preview servers or change the port in `playwright.config.ts` and `package.json` consistently (advanced).
- **First run slow:** `e2e:serve` performs a full `npm run build` before starting preview.
- **Stale `node_modules`:** run `npm ci` before tests in CI-like environments.
