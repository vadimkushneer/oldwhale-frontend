import { useCallback, useMemo, type MouseEventHandler, type ReactNode } from "react";
import i18n from "../../../../i18n";
import { getTranslatedModes } from "../../../domain/blocks";
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

  const modeOption = useMemo(
    () => getTranslatedModes(i18n.t.bind(i18n)).find((item) => item.id === mode),
    [mode, i18n.language],
  );

  const rootClassName = useMemo(
    () => cx("editor-top-bar", `editor-top-bar--accent-${accentTone}`),
    [accentTone],
  );

  const modeIcon = useMemo<ReactNode>(() => modeOption?.icon ?? null, [modeOption]);
  const modeLabel = useMemo(() => String(modeOption?.label ?? mode).toUpperCase(), [mode, modeOption]);

  const statsItems = useMemo<EditorTopBarStatItem[]>(() => {
    const t = i18n.t.bind(i18n);
    return [
      { label: t("topBar.timing"), value: stats.timing },
      { label: t("topBar.pages"), value: stats.pages },
      { label: t("topBar.words"), value: stats.words },
      { label: t("topBar.chars"), value: stats.chars },
    ];
  }, [stats.chars, stats.pages, stats.timing, stats.words, i18n.language]);

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

  const labels = useMemo(() => {
    const t = i18n.t.bind(i18n);
    return {
      saveLabel: saved ? t("topBar.saved") : t("topBar.saving"),
      sheetTitle: sheetOn ? t("topBar.hideSheet") : t("topBar.showSheet"),
      aiTitle: aiOpen ? t("topBar.hideAi") : t("topBar.openAi"),
      aiLabel: `${t("topBar.ai")} ${aiOpen ? "▶" : "◀"}`,
    };
  }, [aiOpen, saved, sheetOn, i18n.language]);

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
    saveLabel: labels.saveLabel,
    sheetTitle: labels.sheetTitle,
    aiTitle: labels.aiTitle,
    aiLabel: labels.aiLabel,
    preventMouseDown,
  };
}
