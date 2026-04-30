import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { Whale } from "../../../ui/Whale";
import { useEditorSideMenu, type EditorSideMenuProps, type EditorSideMenuProjectRow } from "./useEditorSideMenu";
import "./EditorSideMenu.scss";

export type { EditorSideMenuProps };

function strokeIcon(children: ReactNode) {
  return (
    <svg
      className="editor-side-menu__svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      {children}
    </svg>
  );
}

function ProjectRowIcon({ rowKey }: { rowKey: EditorSideMenuProjectRow["key"] }) {
  switch (rowKey) {
    case "new":
      return strokeIcon(
        <>
          <path d="M12 5v14M5 12h14" />
        </>,
      );
    case "save":
    case "saveAs":
      return strokeIcon(
        <>
          <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
          <polyline points="17 21 17 13 7 13 7 21" />
          <polyline points="7 3 7 8 15 8" />
        </>,
      );
    case "history":
      return strokeIcon(
        <>
          <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
        </>,
      );
    case "myProjects":
      return strokeIcon(
        <>
          <rect x="2" y="7" width="20" height="14" rx="2" />
          <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
          <line x1="12" y1="12" x2="12" y2="16" />
          <line x1="10" y1="14" x2="14" y2="14" />
        </>,
      );
    default:
      return null;
  }
}

function ExportRowIcon({ rowKey }: { rowKey: string }) {
  switch (rowKey) {
    case "pdf":
      return strokeIcon(
        <>
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="12" y1="18" x2="12" y2="12" />
          <line x1="9" y1="15" x2="15" y2="15" />
        </>,
      );
    case "docx":
      return strokeIcon(
        <>
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="16" y1="13" x2="8" y2="13" />
          <line x1="16" y1="17" x2="8" y2="17" />
          <polyline points="10 9 9 9 8 9" />
        </>,
      );
    case "fdx":
      return strokeIcon(
        <>
          <rect x="2" y="2" width="20" height="20" rx="3" />
          <line x1="7" y1="2" x2="7" y2="22" />
          <line x1="17" y1="2" x2="17" y2="22" />
          <line x1="2" y1="12" x2="22" y2="12" />
        </>,
      );
    case "txt":
      return strokeIcon(
        <>
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="16" y1="13" x2="8" y2="13" />
          <line x1="16" y1="17" x2="8" y2="17" />
        </>,
      );
    default:
      return null;
  }
}

function IconOpenFile() {
  return strokeIcon(
    <>
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="17 8 12 3 7 8" />
      <line x1="12" y1="3" x2="12" y2="15" />
    </>,
  );
}

function IconShare() {
  return strokeIcon(
    <>
      <circle cx="18" cy="5" r="3" />
      <circle cx="6" cy="12" r="3" />
      <circle cx="18" cy="19" r="3" />
      <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
      <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
    </>,
  );
}

function IconAdmin() {
  return strokeIcon(
    <>
      <circle cx="12" cy="12" r="3" />
      <path d="M12 1v2m0 18v2M4.22 4.22l1.42 1.42m12.72 12.72 1.42 1.42M1 12h2m18 0h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
    </>,
  );
}

function SideMenuHeader({ showClose, onClose }: { showClose: boolean; onClose: () => void }) {
  return (
    <div className="editor-side-menu__header">
      <div className="editor-side-menu__logo-wrap">
        <Whale size={22} />
      </div>
      <div className="editor-side-menu__titles">
        <div className="editor-side-menu__title-main">OLD WHALE</div>
        <div className="editor-side-menu__title-sub">РЕДАКТОР</div>
      </div>
      {showClose ? (
        <button type="button" className="editor-side-menu__close" onClick={onClose} aria-label="Закрыть панель">
          ✕
        </button>
      ) : null}
    </div>
  );
}

function SideMenuSection({
  title,
  variantClass,
  children,
}: {
  title: string;
  variantClass: "project" | "files" | "modes" | "misc";
  children: ReactNode;
}) {
  return (
    <div className={`editor-side-menu__section editor-side-menu__section--${variantClass}`}>
      <div className="editor-side-menu__section-title">{title}</div>
      {children}
    </div>
  );
}

export function EditorSideMenu(props: EditorSideMenuProps) {
  const { variant, onClose, onSwitchMode, onOpenImportPicker, onImportFileChange, onGoHome, onShare, showAdminLink } =
    props;
  const vm = useEditorSideMenu(props);

  return (
    <div className={vm.rootClassName}>
      <div className="editor-side-menu__shell">
        <button
          type="button"
          className="editor-side-menu__overlay"
          aria-label="Закрыть меню"
          onClick={vm.handleOverlayClick}
        />
        <div
          className="editor-side-menu__panel ow-app-scrollbar"
          role="dialog"
          aria-modal="true"
          aria-label="Меню редактора"
        >
          <SideMenuHeader showClose={vm.showHeaderClose} onClose={onClose} />

          <SideMenuSection title="ПРОЕКТ" variantClass="project">
            {vm.projectRows.map((row) => (
              <button key={row.key} type="button" className="editor-side-menu__simple-row" onClick={row.onClick}>
                <span className="editor-side-menu__row-icon">
                  <ProjectRowIcon rowKey={row.key as EditorSideMenuProjectRow["key"]} />
                </span>
                {row.label}
              </button>
            ))}
          </SideMenuSection>

          <SideMenuSection title="ФАЙЛЫ" variantClass="files">
            <input
              id={vm.importInputId}
              className="editor-side-menu__import-input"
              type="file"
              accept=".whale,.fdx,application/json,application/xml"
              capture={false}
              onChange={onImportFileChange}
            />
            {vm.exportRows.map((row) =>
              row.hidden ? null : (
                <button
                  key={row.key}
                  type="button"
                  className={`editor-side-menu__rich-row${row.locked ? " editor-side-menu__rich-row--locked" : ""}`}
                  onClick={row.onClick}
                >
                  <span className="editor-side-menu__rich-row-icon">
                    <ExportRowIcon rowKey={row.key} />
                  </span>
                  <div className="editor-side-menu__rich-row-body">
                    <div>{row.label}</div>
                    <div className="editor-side-menu__rich-row-sub">
                      {row.locked ? "Войдите чтобы использовать" : row.sub}
                    </div>
                  </div>
                </button>
              ),
            )}
            <button type="button" className="editor-side-menu__rich-row" onClick={onOpenImportPicker}>
              <span className="editor-side-menu__rich-row-icon">
                <IconOpenFile />
              </span>
              <div className="editor-side-menu__rich-row-body">
                <div>Открыть</div>
                <div className="editor-side-menu__rich-row-sub">{vm.openFormatsHint}</div>
              </div>
            </button>
          </SideMenuSection>

          <SideMenuSection title="РЕЖИМ" variantClass="modes">
            {vm.modeRows.map((m) => {
              const rowClass = [
                "editor-side-menu__mode-row",
                m.active ? "editor-side-menu__mode-row--active" : "",
                m.locked ? "editor-side-menu__mode-row--locked" : "",
              ]
                .filter(Boolean)
                .join(" ");
              return (
                <button
                  key={m.id}
                  type="button"
                  className={rowClass}
                  onClick={() => {
                    if (m.locked) return;
                    onSwitchMode(m.id);
                  }}
                >
                  <span className="editor-side-menu__mode-icon">{m.icon}</span>
                  {m.label}
                  {vm.showGuestLoginOnModeRow && m.locked ? (
                    <span className="editor-side-menu__mode-login">ВОЙТИ</span>
                  ) : null}
                  {(variant === "mobile" ? !m.locked && m.active : m.active) ? (
                    <span className="editor-side-menu__mode-check">✓</span>
                  ) : null}
                </button>
              );
            })}
          </SideMenuSection>

          <SideMenuSection title="ПРОЧЕЕ" variantClass="misc">
            {vm.showShare && onShare ? (
              <button type="button" className="editor-side-menu__simple-row" onClick={onShare}>
                <span className="editor-side-menu__row-icon">
                  <IconShare />
                </span>
                Поделиться
              </button>
            ) : null}
            {showAdminLink ? (
              <Link to="/admin" className="editor-side-menu__simple-row editor-side-menu__simple-row--link">
                <span className="editor-side-menu__row-icon">
                  <IconAdmin />
                </span>
                АДМИН
              </Link>
            ) : null}
            <button type="button" className="editor-side-menu__simple-row" onClick={onGoHome}>
              <span className="editor-side-menu__misc-icon">⏻</span>
              На главную
            </button>
          </SideMenuSection>
        </div>
      </div>
    </div>
  );
}
