# Backup — test · pre-zip-19 (2026-05-31)

**Статус:** test checkpoint перед PlayEditorNext (`?next=1`). **НЕ коммитить** без решения автора.

## Что внутри `snapshot.zip`

Снимок состояния после zip 17 (shells) + 18 (`formatSceneLabel`), **до** zip 19:

- `src/modes/` — shells, editor-core, play bricks, registry
- `src/pages/EditorPage.tsx` — `getEditorShell`, без `?next=1`
- `src/legacy/routes/Editor/index.tsx` — god component + formatSceneLabel call sites

## Тесты на момент бэкапа

| Проверка | Результат |
|----------|-----------|
| `tsc -b` | clean |
| `vitest` | **328 / 328 PASS** |
| Browser gate zip 17 | PASS |

## Восстановление

```bash
cd oldwhale-frontend
unzip -o backups/cursor-test-backup-2026-05-31-pre19/snapshot.zip
```
