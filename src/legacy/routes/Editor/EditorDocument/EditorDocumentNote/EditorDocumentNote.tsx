import { useCallback, useRef } from "react";
import type { MutableRefObject } from "react";
import { EditorDocumentNoteToolbar } from "../EditorDocumentNoteToolbar/EditorDocumentNoteToolbar";
import type { EditorDocumentNoteToolbarProps } from "../EditorDocumentNoteToolbar/EditorDocumentNoteToolbar";
import { useEditorDocumentNote } from "./useEditorDocumentNote";
import "./EditorDocumentNote.scss";

type InternalToolbarProps =
  | "noteEditorRef"
  | "saveNoteSelection"
  | "restoreNoteSelection"
  | "execNoteCommand"
  | "applyFontSize"
  | "applyNoteColor";

export type EditorDocumentNoteProps = Omit<EditorDocumentNoteToolbarProps, InternalToolbarProps> & {
  projectId: string;
  spellOn: boolean;
  externalNoteEditorRef?: MutableRefObject<HTMLDivElement | null>;
};

export function EditorDocumentNote(props: EditorDocumentNoteProps) {
  const noteEditorRef = useRef<HTMLDivElement | null>(null);
  const proposedEditorRef = useRef<HTMLDivElement | null>(null);
  const {
    onInput,
    onPaste,
    onFocus,
    onKeyUp,
    onMouseUp,
    saveNoteSelection,
    restoreNoteSelection,
    execNoteCommand,
    applyFontSize,
    applyNoteColor,
    isReviewing,
    reviewData,
    acceptDiff,
    declineDiff,
  } = useEditorDocumentNote({
    noteEditorRef,
    noteTextRef: props.noteTextRef,
    noteSelRangeRef: props.noteSelRangeRef,
    setNoteText: props.setNoteText,
    markDirty: props.markDirty,
    scheduleNoteHistorySnapshot: props.scheduleNoteHistorySnapshot,
    setNoteColorOpen: props.setNoteColorOpen,
  });
  const { projectId, spellOn, externalNoteEditorRef, ...toolbarProps } = props;
  const setNoteEditorRef = useCallback(
    (node: HTMLDivElement | null) => {
      noteEditorRef.current = node;
      if (externalNoteEditorRef) externalNoteEditorRef.current = node;
    },
    [externalNoteEditorRef],
  );

  const handleAccept = useCallback(() => {
    const finalHtml = proposedEditorRef.current ? proposedEditorRef.current.innerHTML : reviewData?.proposedHtml || "";
    acceptDiff(finalHtml);
  }, [acceptDiff, reviewData]);

  return (
    <div className="editor-document-note">
      <EditorDocumentNoteToolbar
        {...toolbarProps}
        noteEditorRef={noteEditorRef}
        saveNoteSelection={saveNoteSelection}
        restoreNoteSelection={restoreNoteSelection}
        execNoteCommand={execNoteCommand}
        applyFontSize={applyFontSize}
        applyNoteColor={applyNoteColor}
      />

      {isReviewing && reviewData ? (
        <div className="note-paste-review">
          <div className="note-paste-review__header">
            <span>Review paste — {reviewData.isLong ? "side-by-side" : "inline"} diff</span>
            <div className="note-paste-review__actions">
              <button type="button" onClick={declineDiff} className="note-paste-review__btn note-paste-review__btn--decline">
                Decline
              </button>
              <button type="button" onClick={handleAccept} className="note-paste-review__btn note-paste-review__btn--accept">
                Accept
              </button>
            </div>
          </div>

          {reviewData.isLong ? (
            <div className="note-paste-review__side-by-side">
              <div className="note-paste-review__pane">
                <div className="note-paste-review__pane-label">Original (removed text highlighted)</div>
                <div
                  className="note-paste-review__original"
                  dangerouslySetInnerHTML={{ __html: reviewData.diffHtml }}
                  contentEditable={false}
                />
              </div>
              <div className="note-paste-review__pane">
                <div className="note-paste-review__pane-label">Proposed (edit here)</div>
                <div
                  ref={proposedEditorRef}
                  className="note-paste-review__proposed"
                  contentEditable
                  suppressContentEditableWarning
                  dangerouslySetInnerHTML={{ __html: reviewData.proposedHtml }}
                />
              </div>
            </div>
          ) : (
            <div className="note-paste-review__inline">
              <div className="note-paste-review__pane">
                <div className="note-paste-review__pane-label">Diff preview (added / removed)</div>
                <div
                  className="note-paste-review__diff"
                  dangerouslySetInnerHTML={{ __html: reviewData.diffHtml }}
                  contentEditable={false}
                />
              </div>
              <div className="note-paste-review__pane">
                <div className="note-paste-review__pane-label">Final result (editable)</div>
                <div
                  ref={proposedEditorRef}
                  className="note-paste-review__proposed"
                  contentEditable
                  suppressContentEditableWarning
                  dangerouslySetInnerHTML={{ __html: reviewData.proposedHtml }}
                />
              </div>
            </div>
          )}

          {reviewData.changes.length > 1 && (
            <div className="note-paste-review__changes-list">
              <div className="note-paste-review__pane-label">Individual changes ({reviewData.changes.length}) — click Accept to apply each one</div>
              {reviewData.changes.map((ch) => (
                <div key={ch.id} className="note-paste-review__change-item">
                  <div className="note-paste-review__change-texts">
                    {ch.removed && <span className="diff-removed">{ch.removed}</span>}
                    {ch.added && <span className="diff-added">{ch.added}</span>}
                  </div>
                  <button
                    type="button"
                    className="note-paste-review__btn note-paste-review__btn--accept"
                    onClick={() => {
                      if (!proposedEditorRef.current) return;
                      const current = proposedEditorRef.current.innerHTML;
                      // simple apply: replace first occurrence of removed with added
                      const newHtml = ch.removed
                        ? current.replace(ch.removed, ch.added)
                        : current + ch.added;
                      proposedEditorRef.current.innerHTML = newHtml;
                    }}
                  >
                    Accept this
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="note-paste-review__hint">
            Edit the proposed text if needed. Accept commits the change with history; Decline restores original.
          </div>
        </div>
      ) : (
        <div
          className="ow-note-editor editor-document-note__editor"
          key={projectId}
          ref={setNoteEditorRef}
          contentEditable
          suppressContentEditableWarning
          spellCheck={spellOn}
          onInput={onInput}
          onFocus={onFocus}
          onKeyUp={onKeyUp}
          onMouseUp={onMouseUp}
          onPaste={onPaste}
          data-placeholder="Мысли, идеи, наброски…"
        />
      )}
    </div>
  );
}
