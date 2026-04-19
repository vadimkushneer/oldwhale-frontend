# Исходники E2E-тестов (`e2e/`)

Спеки Playwright и артефакты снимков лежат в этой папке. **Полное руководство** (стек, команды, CI, troubleshooting) — в корне репозитория:

- **[TESTING.md](../TESTING.md)** (английский)
- **[TESTING.ru.md](../TESTING.ru.md)** (русский)

**Спеки:**

| Файл | Назначение |
|------|------------|
| [`auth-registration.spec.ts`](./auth-registration.spec.ts) | Поведенческий E2E: успешная регистрация и ошибка API (моки). |
| [`visual/routes.spec.ts`](./visual/routes.spec.ts) | Визуальная регрессия: полноэкранные скриншоты по маршрутам и эталоны в `visual/routes.spec.ts-snapshots/`. |
| [`visual/reference.capture.spec.ts`](./visual/reference.capture.spec.ts) | Пересъём эталонов из `public/reference.html` при `CAPTURE_REFERENCE=1`. |

Быстрый старт из корня репозитория: один раз `npx playwright install chromium`, затем `npm run test:e2e`.
