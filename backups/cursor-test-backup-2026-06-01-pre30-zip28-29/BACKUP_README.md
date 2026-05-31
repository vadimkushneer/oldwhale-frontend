# Backup — test · pre-commit zip 28–29 (2026-06-01)

**Статус:** checkpoint после zip 28 (autosave/switchMode isolation) + zip 29 (persistence split → projectStore).

## Что внутри `snapshot.zip`

- `index.tsx` — zip 28+29: `saveProjectForMode` / `loadLastProjectForMode`, deep-clone switchMode, flush on newProject/loadProject, `blocksRef` reset in newProject, per-doc undo reset

## Тесты на момент бэкапа

| Проверка | Результат |
|----------|-----------|
| `tsc -b` | clean |
| `vitest` | **337 / 337 PASS** |
| Browser gate (zip 29 README) | AAA/BBB no leak, Ctrl+Z isolation, film↔play — PASS |

## Восстановление

```bash
cd oldwhale-frontend
unzip -o backups/cursor-test-backup-2026-06-01-pre30-zip28-29/snapshot.zip
cp index.tsx src/legacy/routes/Editor/index.tsx
```
