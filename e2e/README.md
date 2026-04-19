# E2E test sources (`e2e/`)

Playwright specs and snapshot assets for this project live in this folder. The **full guide** (stack, commands, CI, troubleshooting) is in the repository root:

- **[TESTING.md](../TESTING.md)** (English)
- **[TESTING.ru.md](../TESTING.ru.md)** (Russian)

**Specs:**

| File | Role |
|------|------|
| [`auth-registration.spec.ts`](./auth-registration.spec.ts) | Behavioral E2E: registration success and error paths (mocked API). |
| [`visual/routes.spec.ts`](./visual/routes.spec.ts) | Visual regression: full-page screenshots per route vs baselines in `visual/routes.spec.ts-snapshots/`. |
| [`visual/reference.capture.spec.ts`](./visual/reference.capture.spec.ts) | Optional baseline capture from `public/reference.html` when `CAPTURE_REFERENCE=1`. |

Quick start from repo root: `npx playwright install chromium` once, then `npm run test:e2e`.
