# Backup — test · pre-commit zip 26–27 (2026-05-31)

**Статус:** test checkpoint перед коммитом visual parity lock (zip 26) + degradation fix (zip 27). **НЕ коммитить** папку `backups/` без решения автора.

## Что внутри `snapshot.zip`

- `src/pages/EditorPage.tsx` — zip 26: prod play → только legacy EditorScreen
- `src/pages/EditorPage.test.tsx` — routing tests (play default, `?next=1` ignored)
- `src/modes/play/PlayBlocks.tsx` — zip 27: убран `fmtStyle` (origin parity)
- `src/modes/play/PlayBlocks.test.tsx` — +2 parity guard tests
- `src/modes/play/PlayEditorNext.tsx` — increment 7 pagination (on disk, unreachable)

## Тесты на момент бэкапа

| Проверка | Результат |
|----------|-----------|
| `tsc -b` | clean |
| `vitest` | **337 / 337 PASS** |

## Восстановление

```bash
cd oldwhale-frontend
unzip -o backups/cursor-test-backup-2026-05-31-pre27-zip26-27/snapshot.zip -d /tmp/restore-pre27
cp /tmp/restore-pre27/PlayBlocks.tsx src/modes/play/
cp /tmp/restore-pre27/PlayBlocks.test.tsx src/modes/play/
cp /tmp/restore-pre27/PlayEditorNext.tsx src/modes/play/
cp /tmp/restore-pre27/EditorPage.tsx src/pages/
cp /tmp/restore-pre27/EditorPage.test.tsx src/pages/
```
