# Backup — test · pre-zip-20 (2026-05-31)

**Статус:** test checkpoint перед PlayEditorNext increment 2 (keyboard parity).

## Что внутри `snapshot.zip`

- `src/modes/play/PlayEditorNext.tsx` — increment 1
- `src/pages/EditorPage.tsx` — `?next=1` switch

## Тесты на момент бэкапа

| Проверка | Результат |
|----------|-----------|
| `tsc -b` | clean |
| `vitest` | **328 / 328 PASS** |
| Browser gate zip 19 | PASS |

## Восстановление

```bash
cd oldwhale-frontend
unzip -o backups/cursor-test-backup-2026-05-31-pre20/snapshot.zip
```
