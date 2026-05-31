# Backup — Cursor refactor + browser gates (2026-05-30)

**Статус:** эксперимент / на проверке. **НЕ коммитить, НЕ пушить** без решения автора.

## Что внутри архива `snapshot.zip`

Снимок uncommitted working tree от git HEAD `a1812e4` (branch `cursor/oldwhale-lab-editor-fixes`):

- `src/modes/` — zip-рефакторинг Claude (editor-core, document, export, film, registry)
- `index.tsx` — rewires + mount-isolation + bugfixes + FilmSceneBlock mobile
- `EditorDocument.tsx` — FilmSceneBlock desktop
- `EditorPage.tsx` — `key={resolvedMode}`
- `package.json`, `eslint.config.js`
- `cursor-sync-2026-05-30/` — handoff для Claude (diff + checkpoint)

## Тесты на момент бэкапа

| Проверка | Результат |
|----------|-----------|
| `npm run test:unit` | **314 / 314 PASS** |
| `tsc -b` | clean (на момент работ) |
| Browser: FilmSceneBlock UI | PASS |
| Browser: mount-isolation cases 1–2 | PASS (после bugfix) |
| Browser: keyboard ×4 modes (full) | **NOT RUN** |
| Browser: scene drag, history Cmd+Z | **NOT RUN** |
| Playwright `editor-film` / `editor-play` | **NOT RUN** (CDN blocked in agent) |

## Риски / не verified

- Полный keyboard checklist (split mid-text, Backspace-merge, paginated slices)
- Playwright visual regression после FilmSceneBlock на desktop
- Mount-isolation cases 3–11

## Восстановление

```bash
cd oldwhale-frontend
# от a1812e4:
unzip -o backups/cursor-test-backup-2026-05-30/snapshot.zip
```

Или взять отдельно `cursor-handoff-for-claude.zip` для передачи Claude.

## Следующий шаг (план)

BlockTextarea из `renderTextarea` — поверх **этого** дерева, не editor-core-paste zip.
