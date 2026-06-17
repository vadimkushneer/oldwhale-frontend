import { useMemo, type ChangeEventHandler, type ReactNode } from "react";
import i18n from "../../../../i18n";
import { getTranslatedModes } from "../../../domain/blocks";
import { accentToneFromHex, type AccentTone } from "../../../ui/accentTone";

function cx(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(" ");
}

export type EditorSideMenuVariant = "mobile" | "desktop";

export type EditorSideMenuProps = {
  variant: EditorSideMenuVariant;
  accent: string;
  mode: string;
  isGuest: boolean;
  onClose: () => void;
  onNewProject: () => void;
  onSave: () => void;
  onSaveAs: () => void;
  onOpenHistory: () => void;
  onOpenMyProjects?: () => void;
  onExportPdf: () => void;
  onExportDocx: () => void;
  onExportFdx: () => void;
  onExportTxt: () => void;
  onOpenImportPicker: () => void;
  onImportFileChange: ChangeEventHandler<HTMLInputElement>;
  onSwitchMode: (modeId: string) => void;
  onShare?: () => void;
  onGoHome: () => void;
  onLogout: () => void;
  showProfileLink?: boolean;
  showAdminLink?: boolean;
};

export type EditorSideMenuProjectRow = {
  key: string;
  label: string;
  onClick: () => void;
};

export type EditorSideMenuExportRow = {
  key: string;
  label: string;
  sub: string;
  locked: boolean;
  hidden: boolean;
  onClick: () => void;
};

export type EditorSideMenuModeRow = {
  id: string;
  label: string;
  icon: ReactNode;
  locked: boolean;
  active: boolean;
};

export function useEditorSideMenu({
  variant,
  accent,
  mode,
  isGuest,
  onClose,
  onNewProject,
  onSave,
  onSaveAs,
  onOpenHistory,
  onOpenMyProjects,
  onExportPdf,
  onExportDocx,
  onExportFdx,
  onExportTxt,
  onShare,
}: EditorSideMenuProps) {
  const accentTone = useMemo<AccentTone>(() => accentToneFromHex(accent), [accent]);

  const rootClassName = useMemo(
    () => cx("editor-side-menu", `editor-side-menu--${variant}`, `editor-side-menu--accent-${accentTone}`),
    [variant, accentTone],
  );

  const importInputId = variant === "mobile" ? "whale-import" : "whale-import-desk";
  const showHeaderClose = variant === "desktop";
  const showGuestLoginOnModeRow = variant === "mobile";
  const showShare = variant === "mobile" && typeof onShare === "function";

  const openFormatsHint = mode === "film" ? ".whale / .fdx / .docx" : ".whale / .fdx";

  const projectRows = useMemo((): EditorSideMenuProjectRow[] => {
    const t = i18n.t.bind(i18n);
    if (variant === "mobile") {
      return [
        { key: "new", label: t("sideMenu.newProject"), onClick: onNewProject },
        { key: "save", label: t("sideMenu.save"), onClick: onSave },
        { key: "saveAs", label: t("sideMenu.saveAs"), onClick: onSaveAs },
        { key: "history", label: t("sideMenu.history"), onClick: onOpenHistory },
        { key: "myProjects", label: t("sideMenu.myProjects"), onClick: onOpenMyProjects ?? onOpenHistory },
      ];
    }
    return [
      { key: "new", label: t("sideMenu.newProject"), onClick: onNewProject },
      { key: "save", label: t("sideMenu.save"), onClick: onSave },
      { key: "saveAs", label: t("sideMenu.saveAs"), onClick: onSaveAs },
      { key: "history", label: t("sideMenu.history"), onClick: onOpenHistory },
    ];
  }, [variant, onNewProject, onSave, onSaveAs, onOpenHistory, onOpenMyProjects, i18n.language]);

  const exportRows = useMemo((): EditorSideMenuExportRow[] => {
    const t = i18n.t.bind(i18n);
    return [
      {
        key: "pdf",
        label: t("sideMenu.exportPdf"),
        sub: t("sideMenu.exportPdfSub"),
        locked: false,
        hidden: false,
        onClick: onExportPdf,
      },
      {
        key: "docx",
        label: t("sideMenu.exportDocx"),
        sub: t("sideMenu.exportDocxSub"),
        locked: isGuest,
        hidden: mode === "note",
        onClick: onExportDocx,
      },
      {
        key: "fdx",
        label: t("sideMenu.exportFdx"),
        sub: t("sideMenu.exportFdxSub"),
        locked: isGuest,
        hidden: mode === "note" || mode === "media" || mode === "play" || mode === "short",
        onClick: onExportFdx,
      },
      {
        key: "txt",
        label: t("sideMenu.exportTxt"),
        sub: t("sideMenu.exportTxtSub"),
        locked: isGuest,
        hidden: false,
        onClick: onExportTxt,
      },
    ];
  }, [isGuest, mode, onExportPdf, onExportDocx, onExportFdx, onExportTxt, i18n.language]);

  const modeRows = useMemo((): EditorSideMenuModeRow[] => {
    return getTranslatedModes(i18n.t.bind(i18n)).map((m) => ({
      id: m.id,
      label: m.label,
      icon: m.icon,
      locked: isGuest && m.id !== "note",
      active: mode === m.id,
    }));
  }, [isGuest, mode, i18n.language]);

  const handleOverlayClick = () => {
    onClose();
  };

  return {
    rootClassName,
    importInputId,
    showHeaderClose,
    showGuestLoginOnModeRow,
    showShare,
    openFormatsHint,
    projectRows,
    exportRows,
    modeRows,
    handleOverlayClick,
  };
}
