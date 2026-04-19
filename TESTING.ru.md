# Инфраструктура тестирования

Здесь описаны автоматические тесты **фронтенда OldWhale**: поведенческие E2E, визуальная регрессия (эталонные скриншоты по маршрутам), CI и как всё запускать и обновлять.

**English:** [TESTING.md](./TESTING.md)

---

## Стек и окружение

- **Раннер:** [Playwright Test](https://playwright.dev/) (`@playwright/test`, версия зафиксирована в `package.json`).
- **Конфиг:** [`playwright.config.ts`](./playwright.config.ts) — `testDir: "e2e"`, только Chromium, `baseURL: http://127.0.0.1:4173`, `webServer` запускает **`npm run e2e:serve`** (production-сборка + Vite preview на порту **4173**). Для тестов **не** нужно отдельно поднимать `npm run dev`.
- **API в тестах:** в E2E-сборке задано `VITE_API_URL=http://127.0.0.1:4173`, SPA ходит на тот же origin; в спеках используется **`page.route`** для подмены JSON (`/api/me`, `/api/auth/register`, админ-маршруты и т.д.).

**Однократная настройка (на машину):** установите бинарники браузера под зафиксированную версию Playwright:

```bash
npx playwright install chromium
```

Команды выполняйте из **корня репозитория** (`oldwhale-frontend/`).

---

## 1) Поведенческие E2E-тесты (пользовательские сценарии)

**Да — есть E2E-тесты, которые прогоняют реальные действия в UI** (клики, ввод, навигация), при этом API замокан через `page.route`.

| Спека | Что покрывает |
|-------|----------------|
| [`e2e/auth-registration.spec.ts`](./e2e/auth-registration.spec.ts) | Регистрация: успех → редирект на `/editor` и токен в `localStorage`; ошибка API → текст ошибки на экране, остаёмся на `/login`. |

Других файлов `*.spec.ts`, кроме регистрации и визуального набора (ниже), в проекте нет.

**Только E2E регистрации:**

```bash
npm run test:e2e -- auth-registration.spec.ts
```

**Один тест по названию:**

```bash
npx playwright test -g "completes registration"
```

**Отладка локально:** в конфиге включено `trace: on-first-retry`. Интерактивно:

```bash
npx playwright test --ui
```

---

## 2) Визуальная регрессия (скриншоты по маршрутам)

**Да — есть тесты, которые сравнивают приложение с PNG-эталонами по маршрутам**, через `expect(page).toHaveScreenshot(...)`.

| Спека | Что покрывает |
|-------|----------------|
| [`e2e/visual/routes.spec.ts`](./e2e/visual/routes.spec.ts) | Полноэкранные скриншоты для `/` (onboarding), `/login`, `/editor` (гость и режимы note / film / play / media), `/admin` (админ и «недостаточно прав»). |
| [`e2e/visual/reference.capture.spec.ts`](./e2e/visual/reference.capture.spec.ts) | **Только пересъём эталонов** (включается при `CAPTURE_REFERENCE=1`): управляет [`public/reference.html`](./public/reference.html) и пишет PNG в ту же папку снимков, что использует `routes.spec.ts`. |

Эталоны лежат в [`e2e/visual/routes.spec.ts-snapshots/`](./e2e/visual/routes.spec.ts-snapshots/) как `*-chromium-linux.png` и `*-chromium-darwin.png` (зависят от ОС). Допуск расхождения задаётся в `playwright.config.ts` (`expect.toHaveScreenshot.maxDiffPixels`, сейчас **18000**), чтобы учитывать шрифты/ОС и при этом ловить поломки вёрстки и цветов.

**Только визуальные тесты:**

```bash
npm run test:e2e -- visual/routes.spec.ts
```

**Все тесты Playwright** (поведенческие + визуальные; capture-спека пропускается, если не задан `CAPTURE_REFERENCE=1`):

```bash
npm run test:e2e
```

### Обновление эталонов после намеренных правок UI

1. **Свести с эталоном из [`reference.html`](./reference.html)** (standalone легаси): переснять из `reference.html`:

   ```bash
   npm run test:e2e:capture-reference
   # подмножество:
   npm run test:e2e:capture-reference -- -g onboarding
   ```

   (`CAPTURE_REFERENCE=1` выставляет npm-скрипт `test:e2e:capture-reference`.)

2. **Экраны, которых нет в `reference.html`** (например админка): обновить снимки из текущего React-рендера:

   ```bash
   npm run test:e2e:update -- visual/routes.spec.ts
   ```

Переснимайте на **той же ОС**, которая важна, или в **Linux CI** (например образ `mcr.microsoft.com/playwright` из [`.github/workflows/e2e.yml`](./.github/workflows/e2e.yml)), чтобы PNG **`chromium-linux`** совпадали с GitHub Actions. Если обновить только **darwin** локально, **linux**-эталоны в CI могут оставаться красными.

---

## Скрипты npm (кратко)

| Задача | Команда |
|--------|---------|
| Все тесты Playwright | `npm run test:e2e` |
| Только визуальные | `npm run test:e2e -- e2e/visual/routes.spec.ts` |
| Только E2E регистрации | `npm run test:e2e -- e2e/auth-registration.spec.ts` |
| Переснять эталоны из `reference.html` | `npm run test:e2e:capture-reference` |
| Обновить визуальные снимки из React | `npm run test:e2e:update -- e2e/visual/routes.spec.ts` |

---

## Непрерывная интеграция

[`.github/workflows/e2e.yml`](./.github/workflows/e2e.yml) запускает `npm run test:e2e` с `CI=1` при push и pull request в `main` (образ Playwright Jammy).

---

## Устранение неполадок

- **Порт 4173 занят:** остановите другие preview или согласованно смените порт в `playwright.config.ts` и `package.json` (продвинутый сценарий).
- **Первый запуск долгий:** `e2e:serve` выполняет полный `npm run build` перед preview.
- **Устаревшие зависимости:** в чистом/CI-подобном окружении перед тестами выполните `npm ci`.
