# Old Whale — frontend

Ionic Vue 3 + Vite + Tailwind CSS + Pinia + Vue Router. PWA via `vite-plugin-pwa`; native shells via Capacitor (iOS / Android).

## Scripts

- `npm run dev` — Vite dev server with **HMR** (`host: true` for LAN devices).
- `npm run build` — production build to `dist/`.
- `npm run preview` — preview the production build.
- `npm run cap:sync` — `cap sync` after a build (updates `ios/` / `android/`).

## Environment

- `.env.development` sets `VITE_API_URL` (default `http://127.0.0.1:8080`). Override for staging/production.

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
