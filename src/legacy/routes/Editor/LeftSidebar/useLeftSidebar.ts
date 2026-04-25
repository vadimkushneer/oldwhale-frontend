import { useCallback, useMemo, type CSSProperties, type KeyboardEvent, type ReactNode, type Ref } from "react";
import { MODES } from "../../../domain/blocks";
import type { SceneItem, SceneListProps } from "../SceneList";

const KNOWN_ACCENT_TONES = {
  "#4ade80": "green",
  "#7c6af7": "violet",
  "#f472b6": "pink",
  "#f59e0b": "amber",
  "#60a5fa": "blue",
} as const;

const CREDITS_LIMIT = 500;

type AccentTone = (typeof KNOWN_ACCENT_TONES)[keyof typeof KNOWN_ACCENT_TONES] | "custom";

export type LeftSidebarStats = {
  timing: string | number;
  pages: string | number;
  words: string | number;
};

export type LeftSidebarTooltipProps = Record<string, unknown>;

export type LeftSidebarQuickActionIconName =
  | "projects"
  | "new-project"
  | "scene-cards"
  | "search"
  | "marker"
  | "warning"
  | "waves"
  | "sparkle";

export type LeftSidebarModeTab = {
  id: string;
  label: string;
  icon: ReactNode;
  active: boolean;
  onClick: () => void;
};

export type LeftSidebarStatItem = {
  label: string;
  value: string | number;
};

export type LeftSidebarQuickAction = {
  id: string;
  ariaLabel: string;
  tooltipLabel: string;
  iconName: LeftSidebarQuickActionIconName;
  active?: boolean;
  onClick: () => void;
};

export type LeftSidebarAddAction = {
  id: string;
  label: string;
  onClick: () => void;
};

type LeftSidebarStyle = CSSProperties & {
  "--ls-accent"?: string;
};

export type LeftSidebarProps = {
  width: number;
  mode: string;
  accent: string;
  stats: LeftSidebarStats;
  scenes: readonly SceneItem[];
  activeSceneId: string | null;
  selectedScenes: ReadonlySet<string>;
  markerModeOn: boolean;
  editorSearchOpen: boolean;
  editorSearchQuery: string;
  editorSearchMatchesCount: number;
  searchInputRef: Ref<HTMLInputElement>;
  copyToast: boolean;
  credits: number;
  getTooltipAnchorProps: (label: string) => LeftSidebarTooltipProps;
  getSceneCardMetaById: SceneListProps["getSceneCardMetaById"];
  getDesktopSceneCardMeta: SceneListProps["getDesktopSceneCardMeta"];
  onCollapse: () => void;
  onToggleMenu: () => void;
  onSwitchMode: (modeId: string) => void;
  onOpenMyProjects: () => void;
  onCreateProject: () => void;
  onOpenSceneCards: () => void;
  onToggleEditorSearch: () => void;
  onCloseEditorSearch: () => void;
  onEditorSearchQueryChange: (value: string) => void;
  onToggleMarkerMode: () => void;
  onCopySelectedScenes: () => void;
  onDeleteScene: SceneListProps["onDelScene"];
  onClearSelectedScenes: () => void;
  onGoToScene: SceneListProps["onGoToScene"];
  onSetActiveSceneId: SceneListProps["onSetActiveSceneId"];
  onToggleSceneSelect: SceneListProps["onToggleSceneSelect"];
  onToggleActSelect: SceneListProps["onToggleActSelect"];
  onDupScene: SceneListProps["onDupScene"];
  onMoveScene: SceneListProps["onMoveScene"];
  onAddSceneAfterLast: () => void;
  onInsertFilmAct: () => void;
  onInsertPlayAct: () => void;
  onLogout: () => void;
};

function normalizeAccent(value: string) {
  return String(value || "").trim().toLowerCase();
}

export function useLeftSidebar({
  width,
  accent,
  mode,
  stats,
  scenes,
  selectedScenes,
  markerModeOn,
  copyToast,
  credits,
  onSwitchMode,
  onOpenMyProjects,
  onCreateProject,
  onOpenSceneCards,
  onToggleEditorSearch,
  onToggleMarkerMode,
  onDeleteScene,
  onClearSelectedScenes,
  onCloseEditorSearch,
  onAddSceneAfterLast,
  onInsertFilmAct,
  onInsertPlayAct,
}: LeftSidebarProps) {
  const accentTone = useMemo<AccentTone>(() => {
    return KNOWN_ACCENT_TONES[normalizeAccent(accent) as keyof typeof KNOWN_ACCENT_TONES] ?? "custom";
  }, [accent]);

  const rootStyle = useMemo<LeftSidebarStyle>(() => {
    const style: LeftSidebarStyle = {
      width,
      minWidth: width,
      maxWidth: width,
    };
    if (accentTone === "custom" && accent) {
      style["--ls-accent"] = accent;
    }
    return style;
  }, [accent, accentTone, width]);

  const modeTabs = useMemo<LeftSidebarModeTab[]>(
    () =>
      MODES.map((modeOption) => ({
        id: modeOption.id,
        label: modeOption.label,
        icon: modeOption.icon,
        active: mode === modeOption.id,
        onClick: () => onSwitchMode(modeOption.id),
      })),
    [mode, onSwitchMode],
  );

  const statsItems = useMemo<LeftSidebarStatItem[]>(
    () => [
      { label: "ХРН", value: stats.timing },
      { label: "СТР", value: stats.pages },
      { label: "СЛВ", value: stats.words },
    ],
    [stats.pages, stats.timing, stats.words],
  );

  const quickActionRows = useMemo<LeftSidebarQuickAction[][]>(
    () => [
      [
        {
          id: "projects",
          ariaLabel: "Мои проекты",
          tooltipLabel: "Мои проекты",
          iconName: "projects",
          onClick: onOpenMyProjects,
        },
        {
          id: "new-project",
          ariaLabel: "Новый проект",
          tooltipLabel: "Новый проект",
          iconName: "new-project",
          onClick: onCreateProject,
        },
        {
          id: "scene-cards",
          ariaLabel: "Карточки сцен",
          tooltipLabel: "Карточки сцен",
          iconName: "scene-cards",
          onClick: onOpenSceneCards,
        },
        {
          id: "search",
          ariaLabel: "Поиск в активном редакторе",
          tooltipLabel: "Поиск в активном редакторе",
          iconName: "search",
          onClick: onToggleEditorSearch,
        },
      ],
      [
        {
          id: "marker-mode",
          ariaLabel: "Режим маркера",
          tooltipLabel: "Режим маркера",
          iconName: "marker",
          active: markerModeOn,
          onClick: onToggleMarkerMode,
        },
        {
          id: "extra-2",
          ariaLabel: "Дополнительная кнопка 2",
          tooltipLabel: "Доп. кнопка 2",
          iconName: "warning",
          onClick: () => undefined,
        },
        {
          id: "extra-3",
          ariaLabel: "Дополнительная кнопка 3",
          tooltipLabel: "Доп. кнопка 3",
          iconName: "waves",
          onClick: () => undefined,
        },
        {
          id: "extra-4",
          ariaLabel: "Дополнительная кнопка 4",
          tooltipLabel: "Доп. кнопка 4",
          iconName: "sparkle",
          onClick: () => undefined,
        },
      ],
    ],
    [
      markerModeOn,
      onCreateProject,
      onOpenMyProjects,
      onOpenSceneCards,
      onToggleEditorSearch,
      onToggleMarkerMode,
    ],
  );

  const selectedSceneIds = useMemo(() => Array.from(selectedScenes), [selectedScenes]);

  const deleteSelectedScenes = useCallback(() => {
    if (selectedSceneIds.length === 0) return;
    selectedSceneIds.forEach((sceneId) => onDeleteScene(sceneId));
    onClearSelectedScenes();
  }, [onClearSelectedScenes, onDeleteScene, selectedSceneIds]);

  const handleSearchKeyDown = useCallback(
    (event: KeyboardEvent<HTMLInputElement>) => {
      event.stopPropagation();
      if (event.key === "Escape") {
        event.preventDefault();
        onCloseEditorSearch();
      }
    },
    [onCloseEditorSearch],
  );

  const sceneCount = useMemo(() => scenes.filter((scene) => scene.kind !== "act").length, [scenes]);
  const selectionCount = selectedSceneIds.length;
  const selectionVisible = selectionCount > 0;
  const copyLabel = copyToast ? "✓ СКОПИРОВАНО" : `КОПИРОВАТЬ (${selectionCount})`;

  const addActions = useMemo<LeftSidebarAddAction[]>(() => {
    if (mode === "film") {
      return [
        { id: "add-scene", label: "СЦЕНА", onClick: onAddSceneAfterLast },
        { id: "add-act", label: "АКТ", onClick: onInsertFilmAct },
      ];
    }
    if (mode === "play") {
      return [
        { id: "add-scene", label: "+ СЦЕНА", onClick: onAddSceneAfterLast },
        { id: "add-act", label: "+ АКТ", onClick: onInsertPlayAct },
      ];
    }
    return [{ id: "add-scene", label: "+ НОВАЯ СЦЕНА", onClick: onAddSceneAfterLast }];
  }, [mode, onAddSceneAfterLast, onInsertFilmAct, onInsertPlayAct]);

  const creditsValue = useMemo(() => Math.max(0, Math.min(CREDITS_LIMIT, credits)), [credits]);
  const creditsLow = credits < 50;

  return {
    accentTone,
    rootStyle,
    modeTabs,
    statsItems,
    quickActionRows,
    deleteSelectedScenes,
    handleSearchKeyDown,
    sceneCount,
    selectionCount,
    selectionVisible,
    copyLabel,
    addActions,
    creditsValue,
    creditsLow,
  };
}
