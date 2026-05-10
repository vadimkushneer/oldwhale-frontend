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
        data-placeholder="Свобода, равенство, братство…"
      />
    </div>
  );
}
