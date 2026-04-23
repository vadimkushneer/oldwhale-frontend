// @ts-nocheck
/**
 * AiComposer - desktop AI chat composer extracted verbatim from EditorScreen
 * (previously the JSX block that rendered the drag-and-drop composer plus the
 * "new chat" / "history" toggles and the attach/send buttons).
 *
 * Layout & visuals live in AiComposer.module.css; this file only wires
 * callbacks, props and the small handful of values that genuinely need to
 * cross the CSS boundary at runtime:
 *   - mc:          the current AI-model accent color (passed as --ai-mc
 *                  plus the pre-composed alpha tints --ai-mc-12..55 so the
 *                  CSS doesn't have to know about color-mix())
 *   - composerH:   the user-resizable composer height, projected into --ai-h
 *   - dropActive / historyOpen: surfaced as data- attributes on the nodes
 *                  that change appearance, so CSS expresses the variants
 *                  declaratively instead of branching in JS
 *
 * The rest of the data (history dropdown, file picker handlers, send,
 * tooltip props, …) stays owned by EditorScreen and is threaded through
 * props, mirroring how PlayHeaderEditor does it in this folder.
 */
import React, { useMemo } from "react";
import { BG, SURF, SH_IN, SH_SM, T1, T2 } from "../../ui/tokens";
import styles from "./AiComposer.module.css";

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
    <div ref={layerRef} className={styles.root} style={cssVars}>
      {renderHistoryDropdown?.()}
      <div
        className={styles.box}
        data-drop-active={dropActive || undefined}
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
          className={styles.hiddenFileInput}
        />
        {dropActive && (
          <div className={styles.dropOverlay}>
            <div className={styles.dropBadge}>+</div>
          </div>
        )}
        
        <div className={styles.sideButtons}>
          <button
            className={styles.sideButton}
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
            className={styles.sideButton}
            data-open={historyOpen || undefined}
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
        <div className={styles.center}>
          {pendingFiles.length > 0 && (
            <div className={styles.chips}>
              {pendingFiles.map(file => (
                <div key={file.id} className={styles.chip}>
                  <span className={styles.chipName}>📎 {file.name}</span>
                  <button
                    onClick={() => onRemoveAttachment(file.id)}
                    title="Убрать файл"
                    className={styles.chipRemove}
                  >×</button>
                </div>
              ))}
            </div>
          )}
          <textarea
            className={`${styles.textarea} ai-input`}
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
          className={styles.flatButton}
          onClick={() => onOpenFilePicker(fileInputId)}
          title="Добавить файл"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M21.44 11.05l-8.49 8.49a6 6 0 0 1-8.49-8.49l8.49-8.48a4 4 0 0 1 5.66 5.65l-8.5 8.49a2 2 0 0 1-2.82-2.83l7.78-7.78"/>
          </svg>
        </button>
        <button
          className={`${styles.flatButton} ${styles.sendButton}`}
          onClick={onSend}
        >→</button>
      </div>
    </div>
  );
}
