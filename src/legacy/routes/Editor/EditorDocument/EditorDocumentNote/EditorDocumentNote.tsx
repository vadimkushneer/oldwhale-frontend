import type { MutableRefObject, RefObject } from "react";
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
        data-placeholder="Мысли, идеи, наброски…"
      />
    </div>
  );
}
