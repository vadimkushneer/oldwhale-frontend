# Backup — pre zip 33 (2026-06-01)

**Статус:** checkpoint перед zip 33 (play Backspace fromName + film pagination on open).

**Base commit:** `cf39131` — zip 30–32 (onKey, film title page, doc isolation).

## Что внутри `snapshot.zip`

- `useEditorDocument.ts` — pagination runs once at mount (pre-fix)
- `onKey.ts` / `onKey.test.ts` — без fromName Backspace path (8 tests)
- `PlayBlocks.tsx` — speaker name input без Backspace handler

## Тесты на момент бэкапа

| Проверка | Результат |
|----------|-----------|
| `tsc -b` | clean |
| `vitest` | **349 / 349 PASS** (64 files) |

## Восстановление

```bash
cd oldwhale-frontend
cp backups/cursor-test-backup-2026-06-01-pre33-zip30-32/files/useEditorDocument.ts src/legacy/routes/Editor/EditorDocument/useEditorDocument.ts
cp backups/cursor-test-backup-2026-06-01-pre33-zip30-32/files/onKey.ts src/modes/editor-core/onKey.ts
cp backups/cursor-test-backup-2026-06-01-pre33-zip30-32/files/onKey.test.ts src/modes/editor-core/onKey.test.ts
cp backups/cursor-test-backup-2026-06-01-pre33-zip30-32/files/PlayBlocks.tsx src/modes/play/PlayBlocks.tsx
```
