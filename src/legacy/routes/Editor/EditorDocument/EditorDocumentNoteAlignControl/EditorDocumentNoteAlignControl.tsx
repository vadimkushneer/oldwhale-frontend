import type { MutableRefObject, RefObject } from "react";
import { NOTE_ALIGN_OPTIONS, type NoteAlignValue } from "../editorDocumentNoteConstants";
import { useEditorDocumentNoteAlignControl } from "./useEditorDocumentNoteAlignControl";
import "../EditorDocumentNoteToolbar/EditorDocumentNoteToolbar.scss";
import "./EditorDocumentNoteAlignControl.scss";

function AlignIcon({ align }: { align: "left" | "center" | "right" }) {
  if (align === "center") {
    return (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
        <line x1="3" y1="6" x2="21" y2="6" />
        <line x1="6" y1="12" x2="18" y2="12" />
        <line x1="4" y1="18" x2="20" y2="18" />
      </svg>
    );
  }

  if (align === "right") {
    return (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
        <line x1="3" y1="6" x2="21" y2="6" />
        <line x1="9" y1="12" x2="21" y2="12" />
        <line x1="6" y1="18" x2="21" y2="18" />
      </svg>
    );
  }

  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="3" y1="12" x2="15" y2="12" />
      <line x1="3" y1="18" x2="18" y2="18" />
    </svg>
  );
}

export type EditorDocumentNoteAlignControlProps = {
  noteEditorRef: RefObject<HTMLDivElement | null>;
  noteTextRef: MutableRefObject<string>;
  setNoteText: (html: string) => void;
  markDirty: () => void;
  scheduleNoteHistorySnapshot: (html: string) => void;
  saveNoteSelection: () => void;
  restoreNoteSelection: () => boolean;
  alignOpen: boolean;
  setAlignOpen: (value: boolean | ((prev: boolean) => boolean)) => void;
  align: NoteAlignValue;
  setAlign: (value: NoteAlignValue) => void;
};

export function EditorDocumentNoteAlignControl({
  noteEditorRef,
  noteTextRef,
  setNoteText,
  markDirty,
  scheduleNoteHistorySnapshot,
  saveNoteSelection,
  restoreNoteSelection,
  alignOpen,
  setAlignOpen,
  align,
  setAlign,
}: EditorDocumentNoteAlignControlProps) {
  const c = useEditorDocumentNoteAlignControl();

  return (
    <div className={c.rootClassName}>
      <button
        type="button"
        title="Выравнивание"
        className={c.toggleClassName(alignOpen)}
        onMouseDown={(e) => {
          e.preventDefault();
          setAlignOpen((value) => !value);
        }}
      >
        <AlignIcon align={align} />
      </button>

      {alignOpen ? (
        <div className={c.menuClassName}>
          {NOTE_ALIGN_OPTIONS.map((option) => (
            <button
              key={option.align}
              type="button"
              className={c.itemClassName(align === option.align)}
              onMouseDown={(e) => {
                e.preventDefault();
                const editor = noteEditorRef.current;
                if (!editor) return;
                editor.focus();
                restoreNoteSelection();
                document.execCommand(option.cmd, false);
                const html = editor.innerHTML;
                noteTextRef.current = html;
                setNoteText(html);
                markDirty();
                scheduleNoteHistorySnapshot(html);
                saveNoteSelection();
                setAlign(option.align);
                setAlignOpen(false);
              }}
            >
              <AlignIcon align={option.align} />
              <span className={c.iconLabelClassName}>{option.label}</span>
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
