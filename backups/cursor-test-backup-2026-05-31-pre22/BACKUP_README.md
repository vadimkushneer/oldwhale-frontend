# Backup — test · pre-zip-22 (2026-05-31)

**Статус:** test checkpoint после PlayEditorNext increment 3 (persistence / zip 21). **НЕ коммитить** без решения автора.

## Что внутри `snapshot.zip`

- `src/modes/play/PlayEditorNext.tsx` — increment 3 (load/save, autosave, flush-on-unmount)
- `src/modes/document/projectStore.ts` — shared LS load/save
- `src/modes/document/projectStore.test.ts` — 5 round-trip tests
- `src/pages/EditorPage.tsx` — `?next=1` switch

## Тесты на момент бэкапа

| Проверка | Результат |
|----------|-----------|
| `tsc -b` | clean |
| `vitest` | **333 / 333 PASS** |
| Browser gate zip 21 | PASS (F5 persistence, shared storage с `/editor/play`) |

## Восстановление

```bash
cd oldwhale-frontend
unzip -o backups/cursor-test-backup-2026-05-31-pre22/snapshot.zip
```
