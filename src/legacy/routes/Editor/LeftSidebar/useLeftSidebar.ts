import { useCallback, useMemo, type CSSProperties, type KeyboardEvent, type ReactNode, type Ref } from "react";
import i18n from "../../../../i18n";
import { getTranslatedModes } from "../../../domain/blocks";
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
  onTopUp?: () => void;
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
      getTranslatedModes(i18n.t.bind(i18n)).map((modeOption) => ({
        id: modeOption.id,
        label: modeOption.label,
        icon: modeOption.icon,
        active: mode === modeOption.id,
        onClick: () => onSwitchMode(modeOption.id),
      })),
    [mode, onSwitchMode, i18n.language],
  );

  const statsItems = useMemo<LeftSidebarStatItem[]>(() => {
    const t = i18n.t.bind(i18n);
    return [
      { label: t("leftSidebar.statsTiming"), value: stats.timing },
      { label: t("leftSidebar.statsPages"), value: stats.pages },
      { label: t("leftSidebar.statsWords"), value: stats.words },
    ];
  }, [stats.pages, stats.timing, stats.words, i18n.language]);

  const quickActionRows = useMemo<LeftSidebarQuickAction[][]>(() => {
    const t = i18n.t.bind(i18n);
    return [
      [
        {
          id: "projects",
          ariaLabel: t("leftSidebar.myProjects"),
          tooltipLabel: t("leftSidebar.myProjects"),
          iconName: "projects",
          onClick: onOpenMyProjects,
        },
        {
          id: "new-project",
          ariaLabel: t("leftSidebar.newProject"),
          tooltipLabel: t("leftSidebar.newProject"),
          iconName: "new-project",
          onClick: onCreateProject,
        },
        {
          id: "scene-cards",
          ariaLabel: t("leftSidebar.sceneCards"),
          tooltipLabel: t("leftSidebar.sceneCards"),
          iconName: "scene-cards",
          onClick: onOpenSceneCards,
        },
        {
          id: "search",
          ariaLabel: t("leftSidebar.search"),
          tooltipLabel: t("leftSidebar.search"),
          iconName: "search",
          onClick: onToggleEditorSearch,
        },
      ],
      [
        {
          id: "marker-mode",
          ariaLabel: t("leftSidebar.markerMode"),
          tooltipLabel: t("leftSidebar.markerMode"),
          iconName: "marker",
          active: markerModeOn,
          onClick: onToggleMarkerMode,
        },
        {
          id: "extra-2",
          ariaLabel: t("leftSidebar.extra2Aria"),
          tooltipLabel: t("leftSidebar.extra2"),
          iconName: "warning",
          onClick: () => undefined,
        },
        {
          id: "extra-3",
          ariaLabel: t("leftSidebar.extra3Aria"),
          tooltipLabel: t("leftSidebar.extra3"),
          iconName: "waves",
          onClick: () => undefined,
        },
        {
          id: "extra-4",
          ariaLabel: t("leftSidebar.extra4Aria"),
          tooltipLabel: t("leftSidebar.extra4"),
          iconName: "sparkle",
          onClick: () => undefined,
        },
      ],
    ];
  }, [
    markerModeOn,
    onCreateProject,
    onOpenMyProjects,
    onOpenSceneCards,
    onToggleEditorSearch,
    onToggleMarkerMode,
    i18n.language,
  ]);

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

  const copyLabel = useMemo(() => {
    const t = i18n.t.bind(i18n);
    return copyToast ? t("leftSidebar.copied") : t("leftSidebar.copy", { count: selectionCount });
  }, [copyToast, selectionCount, i18n.language]);

  const addActions = useMemo<LeftSidebarAddAction[]>(() => {
    const t = i18n.t.bind(i18n);
    if (mode === "film") {
      return [
        { id: "add-scene", label: t("leftSidebar.addScene"), onClick: onAddSceneAfterLast },
        { id: "add-act", label: t("leftSidebar.addAct"), onClick: onInsertFilmAct },
      ];
    }
    if (mode === "play") {
      return [
        { id: "add-scene", label: t("leftSidebar.addScenePlay"), onClick: onAddSceneAfterLast },
        { id: "add-act", label: t("leftSidebar.addActPlay"), onClick: onInsertPlayAct },
      ];
    }
    if (mode === "note") {
      return [];
    }
    return [{ id: "add-scene", label: t("leftSidebar.addNewScene"), onClick: onAddSceneAfterLast }];
  }, [mode, onAddSceneAfterLast, onInsertFilmAct, onInsertPlayAct, i18n.language]);

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
