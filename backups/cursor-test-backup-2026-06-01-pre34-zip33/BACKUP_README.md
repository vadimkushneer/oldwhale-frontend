# Backup — pre zip 34 (2026-06-01)

**Статус:** checkpoint перед zip 34 (pagination diagnostic `ow_debug_pages` on top of zip 33).

**Base commit:** `cf39131` + uncommitted zip 33 (play Backspace fromName, film remeasureTick).

## Что внутри `snapshot.zip`

- `useEditorDocument.ts` — zip 33 (remeasureTick), без diagnostic
- `onKey.ts` / `onKey.test.ts` — zip 33 fromName Backspace (+10 tests)
- `PlayBlocks.tsx` — zip 33 mobile name Backspace

## Тесты на момент бэкапа

| Проверка | Результат |
|----------|-----------|
| `tsc -b` | clean |
| `vitest` | **351 / 351 PASS** |

## Восстановление

```bash
cd oldwhale-frontend
cp backups/cursor-test-backup-2026-06-01-pre34-zip33/files/useEditorDocument.ts src/legacy/routes/Editor/EditorDocument/useEditorDocument.ts
cp backups/cursor-test-backup-2026-06-01-pre34-zip33/files/onKey.ts src/modes/editor-core/onKey.ts
cp backups/cursor-test-backup-2026-06-01-pre34-zip33/files/onKey.test.ts src/modes/editor-core/onKey.test.ts
cp backups/cursor-test-backup-2026-06-01-pre34-zip33/files/PlayBlocks.tsx src/modes/play/PlayBlocks.tsx
```
