// @ts-nocheck
/**
 * AiComposer - desktop AI chat composer extracted verbatim from EditorScreen
 * (originally the JSX block that rendered the drag-and-drop composer plus
 * the "new chat" / "history" toggles and the attach/send buttons).
 *
 * The component owns nothing but JSX + callback wiring. All visuals live
 * in AiComposer.scss under the `ai-composer` BEM block (__element, --modifier).
 * The only things that cross the CSS boundary at runtime come through the
 * inline `cssVars` on the root so they can be read from nested selectors
 * without prop drilling:
 *   --ai-bg / --ai-surf / --ai-sh-in / --ai-sh-sm / --ai-t1 / --ai-t2
 *       static design tokens copied from ui/tokens.ts so this component
 *       stays self-contained and drop-in-ready.
 *   --ai-mc + --ai-mc-12..55
 *       the current AI model's accent color plus pre-composed alpha tints
 *       (so SCSS doesn't have to call color-mix).
 *   --ai-h
 *       the user-resizable composer height, projected so resizing doesn't
 *       force a component re-render of the SCSS rules.
 */
import React, { useMemo } from "react";
import { BG, SURF, SH_IN, SH_SM, T1, T2 } from "../../ui/tokens";
import "./AiComposer.scss";

const cn = (...parts) => parts.filter(Boolean).join(" ");

export function AiComposer({
  layerRef,
  composerH,
  dropActive,
  historyOpen,
  pendingFiles,
  input,
  placeholder,
  fileInputId,
  fileAccept,
  mc,
  renderHistoryDropdown,
  getTooltipAnchorProps,
  onInputChange,
  onSend,
  onStartNewChat,
  onToggleHistory,
  onRemoveAttachment,
  onImportFiles,
  onOpenFilePicker,
  onDragEnter,
  onDragOver,
  onDragLeave,
  onDrop,
}) {
  const cssVars = useMemo(() => ({
    "--ai-bg": BG,
    "--ai-surf": SURF,
    "--ai-sh-in": SH_IN,
    "--ai-sh-sm": SH_SM,
    "--ai-t1": T1,
    "--ai-t2": T2,
    "--ai-mc": mc,
    "--ai-mc-12": `${mc}12`,
    "--ai-mc-14": `${mc}14`,
    "--ai-mc-16": `${mc}16`,
    "--ai-mc-18": `${mc}18`,
    "--ai-mc-20": `${mc}20`,
    "--ai-mc-28": `${mc}28`,
    "--ai-mc-30": `${mc}30`,
    "--ai-mc-55": `${mc}55`,
    "--ai-h": `${composerH}px`,
  }), [mc, composerH]);

  const stopPropagation = e => e.stopPropagation();

  return (
    <div ref={layerRef} className="ai-composer" style={cssVars}>
      {renderHistoryDropdown?.()}
      <div
        className={cn("ai-composer__panel", dropActive && "ai-composer__panel--drop-active")}
        onDragEnter={onDragEnter}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
      >
        <input
          id={fileInputId}
          type="file"
          multiple
          accept={fileAccept}
          onChange={onImportFiles}
          className="ai-composer__file-input"
        />
        {dropActive && (
          <div className="ai-composer__drop-overlay">
            <div className="ai-composer__drop-badge">+</div>
          </div>
        )}
        <div className="ai-composer__side-buttons">
          <button
            className="ai-composer__side-button"
            onClick={onStartNewChat}
            aria-label="Новый чат"
            {...getTooltipAnchorProps("Новый чат")}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M12 5v14"/>
              <path d="M5 12h14"/>
            </svg>
          </button>
          <button
            className={cn("ai-composer__side-button", historyOpen && "ai-composer__side-button--open")}
            onClick={onToggleHistory}
            aria-label="Просмотреть историю"
            {...getTooltipAnchorProps("История чатов")}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M6 7h12"/>
              <path d="M6 12h12"/>
              <path d="M6 17h12"/>
            </svg>
          </button>
        </div>
        <div className="ai-composer__center">
          {pendingFiles.length > 0 && (
            <div className="ai-composer__chips">
              {pendingFiles.map(file => (
                <div key={file.id} className="ai-composer__chip">
                  <span className="ai-composer__chip-name">📎 {file.name}</span>
                  <button
                    onClick={() => onRemoveAttachment(file.id)}
                    title="Убрать файл"
                    className="ai-composer__chip-remove"
                  >×</button>
                </div>
              ))}
            </div>
          )}
          <textarea
            className="ai-composer__textarea ai-input"
            value={input}
            onChange={e => onInputChange(e.target.value)}
            onKeyDown={e => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                onSend();
              }
            }}
            onMouseDown={stopPropagation}
            onPointerDown={stopPropagation}
            onWheel={stopPropagation}
            onTouchStart={stopPropagation}
            onTouchMove={stopPropagation}
            data-ai-scrollable="true"
            rows={1}
            placeholder={placeholder}
          />
        </div>
        <button
          className="ai-composer__flat-button"
          onClick={() => onOpenFilePicker(fileInputId)}
          title="Добавить файл"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M21.44 11.05l-8.49 8.49a6 6 0 0 1-8.49-8.49l8.49-8.48a4 4 0 0 1 5.66 5.65l-8.5 8.49a2 2 0 0 1-2.82-2.83l7.78-7.78"/>
          </svg>
        </button>
        <button
          className="ai-composer__flat-button ai-composer__flat-button--send"
          onClick={onSend}
        >→</button>
      </div>
    </div>
  );
}
