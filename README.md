# Old Whale — frontend

Ionic Vue 3 + Vite + Tailwind CSS + Pinia + Vue Router. PWA via `vite-plugin-pwa`; native shells via Capacitor (iOS / Android).

## Scripts

- `npm run dev` — Vite dev server with **HMR** (`host: true` for LAN devices).
- `npm run build` — production build to `dist/`.
- `npm run preview` — preview the production build.
- `npm run cap:sync` — `cap sync` after a build (updates `ios/` / `android/`).

## Environment

- `.env.development` sets `VITE_API_URL` (default `http://127.0.0.1:8080`). Override for staging/production.
- `.env.production` sets `VITE_API_URL` for production builds (e.g. the hosted API on Render).
- **`VITE_BASE_PATH`** (build-time only, read in `vite.config.ts`): public path where the app is served. Use `/` for a site at the domain root. For GitHub project pages at `https://<user>.github.io/<repo>/`, set it to `/<repo>/` (trailing slash is normalized automatically).

## Deploy to GitHub Pages

1. Push this repository to GitHub.
2. **Settings → Pages → Build and deployment**: set source to **GitHub Actions** (not “Deploy from a branch”).
3. On the first run, approve **Pages** for the `github-pages` environment if GitHub prompts you.
4. The workflow [.github/workflows/deploy-github-pages.yml](.github/workflows/deploy-github-pages.yml) builds with `npm run build:gh-pages`, which copies `dist/index.html` to `dist/404.html` so Vue Router history mode works on refresh.
5. **Base path**: by default the workflow sets `VITE_BASE_PATH` to `/<repository-name>/`, which matches `https://<user>.github.io/<repo>/`. For a **user or organization site** whose URL is `https://<user>.github.io` with no repository segment, create a repository variable **`VITE_BASE_PATH`** with value `/` (and optionally **`VITE_API_URL`** if it differs from the default in the workflow).
6. **Backend**: the production API URL is baked in at build time via `VITE_API_URL` (`.env.production` locally, or `vars.VITE_API_URL` in Actions). Ensure the API allows your Pages origin in CORS if you set `CORS_ORIGIN` on the server (otherwise the backend defaults to `*`). For Render, you can configure a health check against **`GET /health`** on the API.

## Desktop and mobile

- Layout uses responsive breakpoints (e.g. scene rail and AI panel collapse into tabs under 768px).
- For **Capacitor**: run `npm run build`, then `npx cap add ios` / `npx cap add android` once, then `npm run cap:sync`. Open native projects in Xcode / Android Studio.
- For **dev on device**, point `server.url` in `capacitor.config.ts` at your machine IP (see Capacitor docs).

## As a separate Git repository

```bash
cd oldwhale-frontend
git init
git add .
git commit -m "Initial Old Whale frontend"
```

## Relation to the original HTML app

This app ports the **Old Whale** screenplay / rundown editor: onboarding wheel, login, modes (film, play, short, media, note), block model, scene list, AI side panel (mocked responses), local project storage, and keyboard shortcuts. Full PDF/DOCX/FDX parity with the single-file React build can be extended using the bundled `jspdf`, `html2canvas`, and `docx` packages.
