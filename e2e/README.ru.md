# Сквозное (E2E) и визуальное тестирование

**English:** [README.md](./README.md)

Playwright управляет приложением на **production-сборке**, отдаваемой с `http://127.0.0.1:4173`. В сборке задано `VITE_API_URL=http://127.0.0.1:4173`, чтобы SPA обращалась к тому же origin; тесты используют **`page.route`** для подмены JSON API (`/api/me`, `/api/auth/register`, админ-маршруты и т.д.). См. [`playwright.config.ts`](../playwright.config.ts).

**Предварительное условие (один раз на машину):** установите бинарники браузера для зафиксированной версии Playwright:

```bash
npx playwright install chromium
```

Команды выполняйте из **корня репозитория** (`oldwhale-frontend/`).

---

## Визуальные регрессионные тесты

**Что это:** [`visual/routes.spec.ts`](visual/routes.spec.ts) делает полноэкранные скриншоты (`toHaveScreenshot`) для onboarding, экрана входа, гостевого редактора и админки. Эталоны лежат в `visual/routes.spec.ts-snapshots/` в виде `*-chromium-linux.png` и `*-chromium-darwin.png` (зависят от ОС).

**Как запустить и проверить**

```bash
npm run test:e2e -- visual/routes.spec.ts
```

Или весь набор (включая этот файл):

```bash
npm run test:e2e
```

- **Успех:** каждый скриншот совпадает с эталоном в пределах [`maxDiffPixels`](../playwright.config.ts) (12000; запас под отличия анти-алиасинга между Babel-standalone и Vite/SWC).
- **Провал:** Playwright сообщает о расхождении пикселей; при падении к тесту прикладываются скриншоты. После **намеренных** правок UI сначала обновите эталоны (ниже).

**Как обновить эталоны после намеренного изменения UI**

Есть два сценария обновления:

1. **UI разошёлся с эталоном из [`reference.html`](../reference.html)** (намеренно: вы правили токены или файлы `src/legacy/routes/*` под фикс в reference). Переснимите baseline напрямую из `reference.html`:

```bash
npm run test:e2e:capture-reference
# или для одного маршрута:
npm run test:e2e:capture-reference -- -g onboarding
```

  Спека [`visual/reference.capture.spec.ts`](visual/reference.capture.spec.ts) загружает `public/reference.html` через Vite preview, прогоняет `screen` state через видимый UI и пишет полноразмерные PNG сразу в `visual/routes.spec.ts-snapshots/` с теми же именами, что ждёт `routes.spec.ts`. Гейт по `CAPTURE_REFERENCE=1`, чтобы обычный `test:e2e` не перезаписывал эталоны.

2. **Намеренное расхождение с reference** (например админ-экраны, у которых нет эталона). Используйте общий флаг обновления:

```bash
npm run test:e2e:update -- visual/routes.spec.ts
```

  (`test:e2e:update` = `playwright test --update-snapshots`.)

Переснимайте эталоны на **той же ОС**, которая важна для вас, или в CI/Linux (например образ `mcr.microsoft.com/playwright` из [`.github/workflows/e2e.yml`](../.github/workflows/e2e.yml)), чтобы PNG **`chromium-linux`** совпадали с тем, что использует GitHub Actions. Если обновить только **darwin** локально, **linux**-эталоны в CI могут оставаться красными, пока их не перегенерируют в Linux или эквивалентной среде.

**CI:** `.github/workflows/e2e.yml` запускает `npm run test:e2e` с `CI=1` при каждом push и pull request в `main`.

---

## E2E-тесты (поведенческие)

**Что это:** спеки на утверждениях без скриншот-эталонов, например [`auth-registration.spec.ts`](auth-registration.spec.ts) (успешная регистрация и ответ API с ошибкой).

**Как запустить и проверить**

```bash
npm run test:e2e -- auth-registration.spec.ts
```

Или один тест по названию:

```bash
npx playwright test -g "completes registration"
```

- **Успех:** проходят проверки (URL, видимый текст, `localStorage`, замоканные маршруты).
- **Провал:** читайте текст ошибки assertion; в конфиге `trace: on-first-retry` (трейс при повторе), локально можно `--debug` или UI:

```bash
npx playwright test --ui
```

В конфиге Playwright **`webServer`** запускает **`npm run e2e:serve`** (сборка + preview на порту **4173**). Отдельный dev-сервер не нужен.

---

## Краткая шпаргалка

| Задача | Команда |
|--------|---------|
| Все тесты Playwright | `npm run test:e2e` |
| Только визуальные | `npm run test:e2e -- visual/` |
| Только E2E регистрации | `npm run test:e2e -- auth-registration.spec.ts` |
| Переснять эталоны из `reference.html` | `npm run test:e2e:capture-reference` |
| Обновить эталоны из текущего React-рендера | `npm run test:e2e:update -- visual/routes.spec.ts` |

---

## Устранение неполадок

- **Порт 4173 занят:** остановите другие `preview` или согласованно смените порт в `playwright.config.ts` и `package.json` (продвинутый сценарий).
- **Первый запуск долгий:** `e2e:serve` выполняет полный `npm run build` перед preview.
- **Устаревший `node_modules`:** в окружениях, похожих на CI, перед тестами выполните `npm ci`.
