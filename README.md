# OldWhale frontend

Single-page application for **OldWhale**: the screenplay / notebook / media editor, rebuilt as a **faithful migration** of the legacy single-file React app [`reference.html`](./reference.html) (visual and behavioral source of truth). Each route lives in its own module under `src/legacy/routes/`; reference-truth PNG baselines for Playwright's visual tests are captured directly from `reference.html` via `npm run test:e2e:capture-reference`.

## Tech stack

- **React 18** + **TypeScript**
- **Vite 5**
- **Tailwind CSS 3** (PostCSS) + legacy global CSS for pixel parity
- **Redux Toolkit** (auth thunks + `adminApi` RTK Query)
- **React Router 6** (`BrowserRouter` basename from `import.meta.env.BASE_URL`)
- **Ionic React 8** UI primitives (`IonApp`, `IonPage`, `IonContent`, `IonSpinner`, …) wrapping each route via [`src/app/IonicRouteShell.tsx`](./src/app/IonicRouteShell.tsx)
- **Capacitor 7** native shells (`android/`, `ios/`) generated from the same Vite `dist/` build

## Environment variables

| Variable | Purpose |
|----------|---------|
| `VITE_API_URL` | Backend origin, e.g. `http://127.0.0.1:8080` (no `/api` suffix). If **unset**, the app calls same-origin `/api/...` and **`npm run dev` proxies `/api` → `VITE_DEV_API_PROXY_TARGET`** (default `http://127.0.0.1:8080`). |
| `VITE_DEV_API_PROXY_TARGET` | Optional. Used only when `VITE_API_URL` is empty during `vite` dev; where to forward `/api` (e.g. API in Docker on another port: `http://127.0.0.1:18080`). |
| `VITE_BASE_PATH` | Vite `base` + router basename. Use `/` locally; for GitHub Pages set to `/<repo>/` (trailing slash). |

Copy [`.env.example`](./.env.example) to `.env` or rely on `.env.development` / `.env.production`.

## Local development (host)

```bash
cd oldwhale-backend
# set DATABASE_URL, then:
go run ./cmd/server
# API listens on :8080 by default (HTTP_ADDR / PORT).

cd oldwhale-frontend
npm ci
npm run dev
```

Open the URL Vite prints (default `http://localhost:5173`).

**Calling the API from the browser**

1. **Recommended:** set `VITE_API_URL=http://127.0.0.1:8080` in `.env` (see [`.env.example`](./.env.example)). The SPA issues requests directly to the Go server; **CORS** on the backend must allow `http://localhost:5173` (see root `docker-compose.yml` → `CORS_ORIGIN`).

2. **Without `VITE_API_URL`:** requests use relative URLs (`/api/...`, including `GET/PUT /api/admin/me/ui-settings`). Vite **proxies** `/api` to **`VITE_DEV_API_PROXY_TARGET`** (default `http://127.0.0.1:8080`). Start the Go API first, then restart `npm run dev` after changing [`vite.config.ts`](./vite.config.ts) proxy settings.

If admin routes (e.g. `/api/admin/me/ui-settings`) return **404** in the browser, you are usually hitting **Vite** (no proxy / wrong target), not Go — fix `VITE_API_URL` or the proxy target, confirm the API is listening, and hard-refresh.

## Docker (full stack from repo parent)

From the **parent** of `oldwhale-frontend` (see root [`docker-compose.yml`](../docker-compose.yml)):

```bash
./dev-stack.sh
# or: docker compose up --build
```

- **Frontend:** `http://localhost:5173` — bind mount of `./oldwhale-frontend`, named volume for `node_modules`, `VITE_API_URL=http://localhost:8080`, `DOCKER=1` (enables file polling for HMR).
- **API:** `http://localhost:8080`

The compose `web` service runs [`docker-entrypoint.sh`](./docker-entrypoint.sh): it runs `npm ci` when the named `node_modules` volume is empty, `package-lock.json` changed, or installs look incomplete (avoids stale volumes where `vite` exists but `@vitejs/plugin-react` is missing), then starts `npm run dev -- --host 0.0.0.0 --port 5173`.

## Production build

```bash
npm run build
```

Output: `dist/`. For **GitHub Pages** use the same build with CI env vars:

```bash
VITE_BASE_PATH="/<repository-name>/" VITE_API_URL="https://your-api.example" npm run build:gh-pages
```

`build:gh-pages` is the same as `build` (kept for workflow compatibility).

## Mobile (Capacitor)

Native Android and iOS apps reuse the same `dist/` bundle as the web build — there is no separate React tree.

```bash
# One-time scaffolding (already committed in this repo as android/ and ios/):
#   npx cap add android
#   npx cap add ios

# Each iteration:
VITE_API_URL="https://your-api.example" npm run build:native   # vite build (no PWA) + cap sync
npm run cap:android   # opens Android Studio
npm run cap:ios       # opens Xcode
```

Things to know:

- **`build:native`** sets `VITE_PWA_DISABLED=1` so no service worker is shipped inside the WebView, then runs `cap sync` to copy `dist/` into `android/app/src/main/assets/public/` and `ios/App/App/public/`. The PWA registration in [`src/main.tsx`](./src/main.tsx) also short-circuits at runtime when `Capacitor.isNativePlatform()` is true.
- **`VITE_API_URL` for devices/emulators** — the WebView cannot reach your laptop via `localhost`. Use:
  - Android emulator: `http://10.0.2.2:8080` (host loopback alias).
  - Physical device on the same Wi-Fi: your machine's LAN IP, e.g. `http://192.168.1.42:8080`.
  - Production: an HTTPS URL.
- **CORS** — the backend's `CORS_ORIGIN` allowlist must include the WebView origin. Capacitor's defaults are `https://localhost` (Android, with `androidScheme: "https"` set in [`capacitor.config.ts`](./capacitor.config.ts)) and `capacitor://localhost` (iOS). See [`oldwhale-backend/.env.example`](../oldwhale-backend/.env.example).
- **iOS `pod install`** requires full Xcode (not just Command Line Tools): `sudo xcode-select -s /Applications/Xcode.app`, then `cd ios/App && pod install` once. Re-run after adding/removing Capacitor plugins.
- **App identifier** — [`capacitor.config.ts`](./capacitor.config.ts) ships with the placeholder `com.oldwhale.app`. Change it before any store submission; the value is permanent for a given listing.
- **What deviates from a textbook Ionic React setup** — we keep `BrowserRouter` from `react-router-dom@6` instead of `IonReactRouter`. Ionic's router integration package still pins `react-router@5`, and downgrading was out of scope. Page-stack swipe-back transitions therefore aren't enabled, but every other Ionic component (and Capacitor as a whole) works.

## GitHub Pages

When this directory is the **root of your Git repository**, use [`.github/workflows/deploy-github-pages.yml`](./.github/workflows/deploy-github-pages.yml): it runs `npm ci`, `npm run build:gh-pages`, and uploads `dist/` as the Pages artifact.

Configure repository variables if needed:

- `VITE_BASE_PATH` — in CI, defaults to `/<github.repository.name>/` (see workflow `env`).
- `VITE_API_URL` — defaults to the DigitalOcean URL used previously.

If you instead keep this folder inside a **monorepo** and push from the parent repo, add `defaults.run.working-directory` and point the artifact at `oldwhale-frontend/dist` (this repo layout assumes a standalone remote).

## Authentication (high level)

- **Login:** `POST /api/auth/login` with `{ login, password }` (not email).
- **Register:** `POST /api/auth/register` with `{ login, email, password }`.
- **Session:** JWT in `localStorage` (`ow_token`). On startup, if a token exists, `GET /api/me` restores the user. **401** clears local auth and routes to `/login`. **Disabled** users are rejected by the API; the client clears auth if `disabled` is true on a successful `User` payload.
- **Logout:** local only (no backend logout endpoint).
- **No** refresh-token, password reset, or profile-edit flows beyond OpenAPI.

## Documentation

- **[User flow: registration](./USER_FLOW_REGISTRATION.md)** — entry points, validation, API, navigation, and QA scenarios for self-service registration.
- **[User flow: login](./USER_FLOW_LOGIN.md)** — form login, session restore (`/api/me`), guards, and failure paths for authenticated vs unauthenticated users.
- **[Testing infrastructure](./TESTING.md)** — Playwright E2E flows, route-by-route visual regression (screenshot baselines), CI, and how to run or update tests.

**Russian (parallel docs):** [README.ru.md](./README.ru.md) · [USER_FLOW_REGISTRATION.ru.md](./USER_FLOW_REGISTRATION.ru.md) · [USER_FLOW_LOGIN.ru.md](./USER_FLOW_LOGIN.ru.md) · [TESTING.ru.md](./TESTING.ru.md)

## Admin

Minimal `/admin` UI (list, create, patch role/disabled, delete). Matches the dark neumorphic palette. **Self-delete** and self-disable are blocked in the UI. **DELETE** treats HTTP **204** with an empty body as success (handled by RTK Query `fetchBaseQuery`).

## PWA

The production build is an installable Progressive Web App powered by [`vite-plugin-pwa`](https://vite-pwa-org.netlify.app/) (Workbox under the hood):

- **Manifest:** emitted at `${BASE_URL}manifest.webmanifest` with dark theme (`#1a1b2e`), `display: standalone`, `scope`/`start_url` derived from `VITE_BASE_PATH` so installs work under custom GitHub Pages paths.
- **Icons:** generated once from [`src/assets/logo-whale-main.png`](./src/assets/logo-whale-main.png) via [`scripts/generate-icons.mjs`](./scripts/generate-icons.mjs) and committed under [`public/icons/`](./public/icons/) (192/512, maskable 512, Apple-touch 180, multi-size `favicon.ico`).
- **Service worker:** registered from [`src/main.tsx`](./src/main.tsx) via `virtual:pwa-register` in **PROD only**. `registerType: "autoUpdate"` + `skipWaiting` + `clientsClaim` → new deploys apply **silently on next navigation**, no user prompt.
- **Caching policy:**
  - App shell (JS/CSS/HTML/icons/fonts/manifest) is **precached** at build time.
  - Same-origin images and fonts: `CacheFirst` (30-day TTL).
  - Everything under `VITE_API_URL` (auth, `/api/me`, admin): `NetworkOnly` — auth tokens and user data are never cached.
  - SPA navigation fallback → `${BASE_URL}index.html`, with `/^\/api\//` denylisted.
- **What works offline:** the editor, local projects (`ow_proj_*`, `ow_index`), note drafts, AI chat store, tooltip state — everything already persisted in `localStorage` by [`src/legacy/routes/Editor/index.tsx`](./src/legacy/routes/Editor/index.tsx).
- **What doesn't work offline:** login, registration, session validation via `/api/me`, admin CRUD. The login form and admin screen show explicit offline messages; the editor skips session-restore on offline boot and re-validates once connectivity returns (see [`src/app/App.tsx`](./src/app/App.tsx) `SessionInit`).
- **Escape hatch:** set `VITE_PWA_DISABLED=1` at build time to disable the plugin entirely — no service worker, no manifest. Used by `npm run e2e:serve` so Playwright visual baselines never observe an SW.

## Project layout

```
oldwhale-frontend/
  Dockerfile.dev          # Dev server image (compose `web`)
  index.html
  package.json
  vite.config.ts
  tailwind.config.js
  postcss.config.js
  reference.html          # Pixel/behavior source of truth (standalone HTML)
  public/
    reference.html        # Copy served by Vite preview for the capture spec
    icons/                # PWA icons generated from the Whale logo (see scripts/generate-icons.mjs)
  scripts/
    generate-icons.mjs    # One-off PWA icon generator (not wired into `build`)
  src/
    app/App.tsx           # Router + session bootstrap
    pages/                # Thin React Router page wrappers (Onboarding, Login, Editor, Admin)
    features/auth/        # authSlice + thunks
    features/admin/       # RTK Query adminApi
    api/                  # env helper + OpenAPI-aligned types
    legacy/
      global.css          # Global rules from legacy HTML
      ui/                 # tokens.ts (design tokens) + Whale.tsx (logo)
      domain/             # blocks.tsx (BLOCK_DEFS, MODES, INIT, AIM/AIR, uid, makeScene)
      hooks/              # useWindowWidth
      util/               # doc.ts (autoH, getScenes, docStats, noteDocStats)
      routes/             # Per-route modules: Onboarding/, Login/, Editor/ (+ Editor/PlayHeader.tsx)
    main.tsx              # Redux + window shims (html2canvas, jspdf, docx, mammoth)
```

## Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Vite dev server (`--host`/`--port` overridden in Docker). |
| `npm run build` | `tsc -b` + `vite build`. |
| `npm run build:gh-pages` | Same as `build` (CI entry point). |
| `npm run build:native` | `VITE_PWA_DISABLED=1 npm run build && cap sync` — produces a service-worker-free bundle and copies it into `android/` and `ios/`. |
| `npm run cap:sync` | `cap sync` only (skip the build) — useful after editing `capacitor.config.ts` or adding a plugin. |
| `npm run cap:android` | Open the Android project in Android Studio. |
| `npm run cap:ios` | Open the iOS project in Xcode. |
| `npm run preview` | Preview production build. |
| `npm run test:e2e` | Run Playwright visual + behavioral suites (see [TESTING.md](./TESTING.md)). |
| `npm run test:e2e:update` | Update Playwright snapshots from the current React render. |
| `npm run test:e2e:capture-reference` | Regenerate visual baselines directly from `reference.html`. |

## Known deviations from the legacy HTML

1. **Login / register** call the real backend instead of a fixed timeout; error text appears in the same card (pink) when the API returns `{ error }`.
2. **Duplicate `color` key** in one textarea style object was removed so the production bundler does not warn; the final computed color is unchanged (last key wins in React inline styles).
3. **Admin link** is a small fixed “АДМИН” control for `role === "admin"` (no legacy equivalent).
4. **Routing** uses URLs (`/`, `/login`, `/editor`, `/admin`) instead of in-memory `screen` state; flows match the old onboarding → login → editor sequence.
5. **CDN libraries** are npm packages and are assigned to `window` in `main.tsx` so existing `window.docx` / `window.mammoth` / `window.jspdf` / `html2canvas` code paths keep working.
6. **Per-route modules** in `src/legacy/routes/` (Onboarding / Login / Editor) replace the previously generated single-file UI bundle. Shared design tokens, domain data, hooks, and helpers live alongside under `src/legacy/{ui,domain,hooks,util}`.

## Git

This folder is intended to be its own Git repository (`git init` after clone if you only received the monorepo). Use the provided [`.gitignore`](./.gitignore) so `node_modules`, `dist`, and local env files stay untracked.
