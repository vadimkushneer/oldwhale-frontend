import type { MutableRefObject, RefObject } from "react";
import { useTranslation } from "react-i18next";
import { EditorDocumentNoteToolbar } from "./EditorDocumentNoteToolbar/EditorDocumentNoteToolbar";
import {
  useEditorDocumentNote,
  type EditorDocumentNoteVariant,
} from "./useEditorDocumentNote";
import "./EditorDocumentNote.scss";

export type EditorDocumentNoteProps = {
  projectId: string;
  spellOn: boolean;
  noteEditorRef: RefObject<HTMLDivElement>;
  noteTextRef: MutableRefObject<string>;
  noteSelRangeRef: MutableRefObject<Range | null>;
  setNoteText: (html: string) => void;
  markDirty: () => void;
  scheduleNoteHistorySnapshot: (html: string) => void;
  getTooltipAnchorProps: (label: string) => Record<string, any>;
  editorVariant?: EditorDocumentNoteVariant;
};

export function EditorDocumentNote({
  projectId,
  spellOn,
  noteEditorRef,
  noteTextRef,
  noteSelRangeRef,
  setNoteText,
  markDirty,
  scheduleNoteHistorySnapshot,
  getTooltipAnchorProps,
  editorVariant = "desktop",
}: EditorDocumentNoteProps) {
  const { t } = useTranslation();
  const {
    noteClassName,
    editorClassName,
    saveNoteSelection,
    restoreNoteSelection,
    execNoteCommand,
    applyFontSize,
    applyNoteColor,
    applyAlignment,
    handleEditorInput,
    handleEditorKeyDown,
    handleEditorPaste,
    pasteDiff,
    acceptPasteDiff,
    declinePasteDiff,
  } = useEditorDocumentNote({
    editorVariant,
    noteEditorRef,
    noteTextRef,
    noteSelRangeRef,
    setNoteText,
    markDirty,
    scheduleNoteHistorySnapshot,
  });

  return (
    <div className={noteClassName}>
      <EditorDocumentNoteToolbar
        execNoteCommand={execNoteCommand}
        applyNoteColor={applyNoteColor}
        applyAlignment={applyAlignment}
        applyFontSize={applyFontSize}
        saveNoteSelection={saveNoteSelection}
        restoreNoteSelection={restoreNoteSelection}
        getTooltipAnchorProps={getTooltipAnchorProps}
      />

      {pasteDiff && (
        <div className="editor-document-note__paste-diff" role="region" aria-label={t("note.pasteReview")}>
          <div className="editor-document-note__paste-diff-header">
            <span className="editor-document-note__paste-diff-title">{t("note.pasteDiffTitle")}</span>
            <div className="editor-document-note__paste-diff-actions">
              <button type="button" className="editor-document-note__paste-diff-button" onClick={acceptPasteDiff}>
                {t("note.accept")}
              </button>
              <button
                type="button"
                className="editor-document-note__paste-diff-button editor-document-note__paste-diff-button--secondary"
                onClick={declinePasteDiff}
              >
                {t("note.decline")}
              </button>
            </div>
          </div>

          <div className="editor-document-note__paste-diff-preview" aria-label={t("note.pasteChanges")}>
            {pasteDiff.parts.map((part, index) => (
              <span
                key={`${index}-${part.value}`}
                className={[
                  "editor-document-note__paste-diff-part",
                  part.added ? "editor-document-note__paste-diff-part--added" : "",
                  part.removed ? "editor-document-note__paste-diff-part--removed" : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
              >
                {part.value}
              </span>
            ))}
          </div>
        </div>
      )}

      <div
        className={editorClassName}
        key={projectId}
        ref={noteEditorRef}
        contentEditable
        suppressContentEditableWarning
        spellCheck={spellOn}
        onInput={handleEditorInput}
        onFocus={saveNoteSelection}
        onKeyDown={handleEditorKeyDown}
        onKeyUp={saveNoteSelection}
        onMouseUp={saveNoteSelection}
        onPaste={handleEditorPaste}
        data-placeholder={t("note.placeholder")}
      />
    </div>
  );
}
