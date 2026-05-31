# Backup — zip 30–32 consolidated (2026-06-01)

**Статус:** checkpoint после zip 30 (onKey extraction), zip 31 (film title page + .whale import isolation), zip 32 (consolidated snapshot + isolation tests).

## Что внутри `snapshot.zip`

- `index.tsx` — onKey wiring, film title page, .whale import isolation (flush/history/blocksRef)
- `EditorDocument.tsx` — desktop film title page render
- `FilmTitlePage.tsx` — editable title / genre / author (bound to export `titlePage`)
- `onKey.ts` + `onKey.test.ts` — block keyboard handler for all modes (8 tests)
- `useEditorCore.isolation.test.ts` — undo/redo cannot cross document switches (3 tests)
- `projectStore.test.ts` — +1 old/minimal doc load test
- `PlayEditorNext.tsx` — minor parity tweak (unrouted)

## Тесты на момент бэкапа

| Проверка | Результат |
|----------|-----------|
| `tsc -b` | clean |
| `vitest` | **349 / 349 PASS** (64 files) |
| `vite build` | clean |
| Browser gate (Enter/Backspace, all block modes) | PASS |

## Восстановление

```bash
cd oldwhale-frontend
unzip -o backups/cursor-test-backup-2026-06-01-zip30-32/snapshot.zip
cp files/index.tsx src/legacy/routes/Editor/index.tsx
cp files/EditorDocument.tsx src/legacy/routes/Editor/EditorDocument/EditorDocument.tsx
cp files/FilmTitlePage.tsx src/legacy/routes/Editor/FilmTitlePage.tsx
cp files/onKey.ts src/modes/editor-core/onKey.ts
cp files/onKey.test.ts src/modes/editor-core/onKey.test.ts
cp files/useEditorCore.isolation.test.ts src/modes/editor-core/useEditorCore.isolation.test.ts
cp files/projectStore.test.ts src/modes/document/projectStore.test.ts
cp files/PlayEditorNext.tsx src/modes/play/PlayEditorNext.tsx
```
