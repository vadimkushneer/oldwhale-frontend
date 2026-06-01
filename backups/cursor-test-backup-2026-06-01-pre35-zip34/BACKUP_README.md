# Backup — pre zip 35 (2026-06-01)

**Статус:** checkpoint перед zip 35 (import pagination recompute on block-count/mode change).

**Base commit:** `cf39131` + uncommitted zip 33–34.

## Что внутри `snapshot.zip`

- `useEditorDocument.ts` — zip 34 (remeasureTick + `ow_debug_pages` diagnostic)
- `onKey.ts` / `onKey.test.ts` / `PlayBlocks.tsx` — zip 33 play Backspace fromName

## Тесты на момент бэкапа

| Проверка | Результат |
|----------|-----------|
| `tsc -b` | clean |
| `vitest` | **351 / 351 PASS** |

## Восстановление

```bash
cd oldwhale-frontend
cp backups/cursor-test-backup-2026-06-01-pre35-zip34/files/useEditorDocument.ts src/legacy/routes/Editor/EditorDocument/useEditorDocument.ts
cp backups/cursor-test-backup-2026-06-01-pre35-zip34/files/onKey.ts src/modes/editor-core/onKey.ts
cp backups/cursor-test-backup-2026-06-01-pre35-zip34/files/onKey.test.ts src/modes/editor-core/onKey.test.ts
cp backups/cursor-test-backup-2026-06-01-pre35-zip34/files/PlayBlocks.tsx src/modes/play/PlayBlocks.tsx
```
