# OldWhale frontend

Single-page application for **OldWhale**: the screenplay / notebook / media editor, rebuilt as a **faithful migration** of the legacy single-file React app [`reference.html`](./reference.html) (visual and behavioral source of truth). Each route lives in its own module under `src/legacy/routes/`; reference-truth PNG baselines for Playwright's visual tests are captured directly from `reference.html` via `npm run test:e2e:capture-reference`.

## Tech stack

- **React 18** + **TypeScript**
- **Vite 5**
- **Tailwind CSS 3** (PostCSS) + legacy global CSS for pixel parity
- **Redux Toolkit** (auth thunks + `adminApi` RTK Query)
- **React Router 6** (`BrowserRouter` basename from `import.meta.env.BASE_URL`)

## Environment variables

| Variable | Purpose |
|----------|---------|
| `VITE_API_URL` | Backend origin, e.g. `http://127.0.0.1:8080` (no `/api` suffix). |
| `VITE_BASE_PATH` | Vite `base` + router basename. Use `/` locally; for GitHub Pages set to `/<repo>/` (trailing slash). |

Copy [`.env.example`](./.env.example) to `.env` or rely on `.env.development` / `.env.production`.

## Local development (host)

```bash
cd oldwhale-frontend
npm ci
npm run dev
```

Open the URL Vite prints (default `http://localhost:5173`). The API must match `VITE_API_URL` (CORS on the backend should allow this origin in Docker: `http://localhost:5173`).

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
