# OldWhale frontend

Одностраничное приложение **OldWhale**: редактор сценария / блокнота / медиа, перенесённый как **точная миграция** легаси-приложения на одном файле React — [`reference.html`](./reference.html) (эталон по внешнему виду и поведению). Каждый маршрут живёт в отдельном модуле под `src/legacy/routes/`; эталонные PNG-скриншоты для Playwright снимаются напрямую из `reference.html` командой `npm run test:e2e:capture-reference`.

**English:** [README.md](./README.md)

## Стек технологий

- **React 18** + **TypeScript**
- **Vite 5**
- **Tailwind CSS 3** (PostCSS) + глобальные легаси-стили для пиксельного совпадения
- **Redux Toolkit** (thunk-и авторизации + RTK Query `adminApi`)
- **React Router 6** (`BrowserRouter`, `basename` из `import.meta.env.BASE_URL`)

## Переменные окружения

| Переменная | Назначение |
|------------|------------|
| `VITE_API_URL` | Origin бэкенда, напр. `http://127.0.0.1:8080` (без суффикса `/api`). |
| `VITE_BASE_PATH` | `base` в Vite + basename роутера. Локально `/`; для GitHub Pages — `/<repo>/` (с завершающим слэшем). |

Скопируйте [`.env.example`](./.env.example) в `.env` или используйте `.env.development` / `.env.production`.

## Локальная разработка (хост)

```bash
cd oldwhale-frontend
npm ci
npm run dev
```

Откройте URL, который выводит Vite (по умолчанию `http://localhost:5173`). Значение `VITE_API_URL` должно соответствовать API (на бэкенде в CORS нужно разрешить этот origin в Docker: `http://localhost:5173`).

## Docker (полный стек из родительского каталога)

Из **родителя** каталога `oldwhale-frontend` (см. корневой [`docker-compose.yml`](../docker-compose.yml)):

```bash
./dev-stack.sh
# или: docker compose up --build
```

- **Frontend:** `http://localhost:5173` — bind mount `./oldwhale-frontend`, именованный volume для `node_modules`, `VITE_API_URL=http://localhost:8080`, `DOCKER=1` (polling для HMR).
- **API:** `http://localhost:8080`

Сервис `web` в compose запускает [`docker-entrypoint.sh`](./docker-entrypoint.sh): выполняет `npm ci`, если volume `node_modules` пуст, менялся `package-lock.json` или установка выглядит неполной (избегает «битых» volume, где есть `vite`, но нет `@vitejs/plugin-react`), затем `npm run dev -- --host 0.0.0.0 --port 5173`.

## Production-сборка

```bash
npm run build
```

Артефакт: `dist/`. Для **GitHub Pages** — та же сборка с переменными CI:

```bash
VITE_BASE_PATH="/<repository-name>/" VITE_API_URL="https://your-api.example" npm run build:gh-pages
```

`build:gh-pages` совпадает с `build` (оставлено для совместимости с CI).

## GitHub Pages

Если этот каталог — **корень Git-репозитория**, используйте [`.github/workflows/deploy-github-pages.yml`](./.github/workflows/deploy-github-pages.yml): `npm ci`, `npm run build:gh-pages`, загрузка `dist/` как артефакт Pages.

При необходимости настройте переменные репозитория:

- `VITE_BASE_PATH` — в CI по умолчанию `/<github.repository.name>/` (см. `env` в workflow).
- `VITE_API_URL` — по умолчанию ранее использовавшийся URL на DigitalOcean.

Если папка внутри **монорепозитория** и пуш идёт из родителя, добавьте `defaults.run.working-directory` и укажите артефакт как `oldwhale-frontend/dist` (текущая раскладка предполагает отдельный remote для этого фронтенда).

## Аутентификация (кратко)

- **Вход:** `POST /api/auth/login` с телом `{ login, password }` (**не** email).
- **Регистрация:** `POST /api/auth/register` с `{ login, email, password }`.
- **Сессия:** JWT в `localStorage` (`ow_token`). При старте, если токен есть, `GET /api/me` восстанавливает пользователя. **401** очищает локальную авторизацию и ведёт на `/login`. **Отключённые** (`disabled`) учётные записи отклоняются API; клиент сбрасывает авторизацию, если в успешном ответе `User` стоит `disabled: true`.
- **Выход:** только на клиенте (эндпоинта logout на бэкенде нет).
- **Нет** refresh-токена, сброса пароля и редактирования профиля сверх описанного в OpenAPI.

## Документация

- **[Пользовательский сценарий: регистрация](./USER_FLOW_REGISTRATION.ru.md)** — точки входа, валидация, API, навигация и сценарии QA для самостоятельной регистрации.
- **[Пользовательский сценарий: вход](./USER_FLOW_LOGIN.ru.md)** — вход по форме, восстановление сессии (`/api/me`), защита маршрутов и ошибки для зарегистрированных и неаутентифицированных пользователей.
- **[Инфраструктура тестирования](./TESTING.ru.md)** — Playwright E2E, визуальная регрессия по маршрутам (эталонные скриншоты), CI, запуск и обновление тестов.

Английские версии тех же документов: [USER_FLOW_REGISTRATION.md](./USER_FLOW_REGISTRATION.md), [USER_FLOW_LOGIN.md](./USER_FLOW_LOGIN.md), [TESTING.md](./TESTING.md).

## Админка

Минимальный UI `/admin` (список, создание, PATCH роли/disabled, удаление). Тёмная нейроморфная палитра. **Самоудаление** и **самоотключение** в UI заблокированы. **DELETE** обрабатывает HTTP **204** с пустым телом как успех (RTK Query `fetchBaseQuery`).

## Структура проекта

```
oldwhale-frontend/
  Dockerfile.dev          # Образ dev-сервера (compose `web`)
  index.html
  package.json
  vite.config.ts
  tailwind.config.js
  postcss.config.js
  reference.html          # Эталон по пикселям и поведению (standalone HTML)
  public/
    reference.html        # Копия, которую раздаёт Vite preview для capture-спеки
  src/
    app/App.tsx           # Роутер + инициализация сессии
    pages/                # Тонкие обёртки React Router (Onboarding, Login, Editor, Admin)
    features/auth/        # authSlice + thunk-и
    features/admin/       # RTK Query adminApi
    api/                  # env-хелпер + типы по OpenAPI
    legacy/
      global.css          # Глобальные правила из легаси HTML
      ui/                 # tokens.ts (дизайн-токены) + Whale.tsx (логотип)
      domain/             # blocks.tsx (BLOCK_DEFS, MODES, INIT, AIM/AIR, uid, makeScene)
      hooks/              # useWindowWidth
      util/               # doc.ts (autoH, getScenes, docStats, noteDocStats)
      routes/             # Модули по маршрутам: Onboarding/, Login/, Editor/ (+ Editor/PlayHeader.tsx)
    main.tsx              # Redux + шимы window (html2canvas, jspdf, docx, mammoth)
```

## Скрипты npm

| Скрипт | Описание |
|--------|----------|
| `npm run dev` | Dev-сервер Vite (`--host`/`--port` переопределяются в Docker). |
| `npm run build` | `tsc -b` + `vite build`. |
| `npm run build:gh-pages` | То же, что `build` (точка входа CI). |
| `npm run preview` | Просмотр production-сборки. |
| `npm run test:e2e` | Playwright (см. [TESTING.ru.md](./TESTING.ru.md)). |
| `npm run test:e2e:update` | Обновить snapshot-ы Playwright из текущего React-рендера. |
| `npm run test:e2e:capture-reference` | Пересобрать визуальные эталоны напрямую из `reference.html`. |

## Известные отличия от легаси HTML

1. **Вход / регистрация** вызывают реальный бэкенд вместо фиксированной задержки; текст ошибки в той же карточке (розовый), если API вернул `{ error }`.
2. **Дублирующийся ключ `color`** в одном объекте стилей textarea удалён, чтобы продакшен-бандлер не предупреждал; итоговый цвет не меняется (в React inline-стилях побеждает последний ключ).
3. **Ссылка «АДМИН»** — небольшой фиксированный контрол при `role === "admin"` (в легаси не было).
4. **Роутинг** по URL (`/`, `/login`, `/editor`, `/admin`) вместо in-memory `screen`; последовательность onboarding → login → editor сохранена.
5. **CDN-библиотеки** подключены как npm-пакеты и выставлены в `window` в `main.tsx`, чтобы сохранились пути `window.docx` / `window.mammoth` / `window.jspdf` / `html2canvas`.

## Git

Этот каталог рассчитан на отдельный Git-репозиторий (`git init` после клонирования, если вы получили только монорепозиторий). Используйте [`.gitignore`](./.gitignore), чтобы не коммитить `node_modules`, `dist` и локальные env-файлы.
