# Backup — zip 33–35 consolidated (2026-06-01)

**Статус:** checkpoint после zip 33 (play Backspace fromName), zip 34 (pagination debug), zip 35 (import pagination recompute on block-count/mode change).

**Base commit:** `cf39131` (zip 30–32).

## Что внутри `snapshot.zip`

- `useEditorDocument.ts` — remeasureTick on mount/fonts; recompute on block count/mode change; optional `ow_debug_pages` console diagnostic
- `onKey.ts` / `onKey.test.ts` — play Backspace from speaker name (+2 tests, 10 total)
- `PlayBlocks.tsx` — mobile play name Backspace wiring

## Тесты на момент бэкапа

| Проверка | Результат |
|----------|-----------|
| `tsc -b` | clean |
| `vitest` | **351 / 351 PASS** (64 files) |

## Восстановление

```bash
cd oldwhale-frontend
cp backups/cursor-test-backup-2026-06-01-zip33-35/files/useEditorDocument.ts src/legacy/routes/Editor/EditorDocument/useEditorDocument.ts
cp backups/cursor-test-backup-2026-06-01-zip33-35/files/onKey.ts src/modes/editor-core/onKey.ts
cp backups/cursor-test-backup-2026-06-01-zip33-35/files/onKey.test.ts src/modes/editor-core/onKey.test.ts
cp backups/cursor-test-backup-2026-06-01-zip33-35/files/PlayBlocks.tsx src/modes/play/PlayBlocks.tsx
```
