import { useCallback, useMemo, type MouseEventHandler, type ReactNode } from "react";
import { MODES } from "../../../domain/blocks";
import { accentToneFromHex, type AccentTone } from "../../../ui/accentTone";

function cx(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(" ");
}

export type EditorTopBarStats = {
  timing: string | number;
  pages: string | number;
  words: string | number;
  chars: string | number;
};

export type EditorTopBarProps = {
  mode: string;
  stats: EditorTopBarStats;
  saved: boolean;
  sheetOn: boolean;
  zoom: number;
  aiOpen: boolean;
  accent: string;
  onToggleSheet: () => void;
  onUndo: () => void;
  onRedo: () => void;
  onZoomOut: () => void;
  onZoomIn: () => void;
  onToggleAi: () => void;
};

export type EditorTopBarStatItem = {
  label: string;
  value: string | number;
};

export function useEditorTopBar({
  mode,
  stats,
  saved,
  sheetOn,
  aiOpen,
  accent,
}: Pick<EditorTopBarProps, "mode" | "stats" | "saved" | "sheetOn" | "aiOpen" | "accent">) {
  const accentTone = useMemo<AccentTone>(() => accentToneFromHex(accent), [accent]);

  const modeOption = useMemo(() => MODES.find((item) => item.id === mode), [mode]);

  const rootClassName = useMemo(
    () => cx("editor-top-bar", `editor-top-bar--accent-${accentTone}`),
    [accentTone],
  );

  const modeIcon = useMemo<ReactNode>(() => modeOption?.icon ?? null, [modeOption]);
  const modeLabel = useMemo(() => String(modeOption?.label ?? mode).toUpperCase(), [mode, modeOption]);

  const statsItems = useMemo<EditorTopBarStatItem[]>(
    () => [
      { label: "ХРН.", value: stats.timing },
      { label: "СТР.", value: stats.pages },
      { label: "СЛОВ", value: stats.words },
      { label: "СИМВ.", value: stats.chars },
    ],
    [stats.chars, stats.pages, stats.timing, stats.words],
  );

  const saveStatusClassName = useMemo(
    () =>
      cx(
        "editor-top-bar__save-status",
        saved ? "editor-top-bar__save-status--saved" : "editor-top-bar__save-status--pending",
      ),
    [saved],
  );

  const saveDotClassName = useMemo(
    () =>
      cx(
        "editor-top-bar__save-dot",
        saved ? "editor-top-bar__save-dot--saved" : "editor-top-bar__save-dot--pending",
      ),
    [saved],
  );

  const sheetToggleClassName = useMemo(
    () => cx("editor-top-bar__sheet-toggle", sheetOn && "editor-top-bar__sheet-toggle--active"),
    [sheetOn],
  );

  const aiToggleClassName = useMemo(
    () => cx("editor-top-bar__ai-toggle", aiOpen && "editor-top-bar__ai-toggle--open"),
    [aiOpen],
  );

  const saveLabel = saved ? "СОХР." : "СОХР...";
  const sheetTitle = sheetOn ? "Скрыть лист" : "Показать лист";
  const aiTitle = aiOpen ? "Скрыть ИИ-панель" : "Открыть ИИ-панель";
  const aiLabel = `ИИ ${aiOpen ? "▶" : "◀"}`;

  const preventMouseDown = useCallback<MouseEventHandler<HTMLButtonElement>>((event) => {
    event.preventDefault();
  }, []);

  return {
    rootClassName,
    modeIcon,
    modeLabel,
    statsItems,
    saveStatusClassName,
    saveDotClassName,
    sheetToggleClassName,
    aiToggleClassName,
    saveLabel,
    sheetTitle,
    aiTitle,
    aiLabel,
    preventMouseDown,
  };
}
