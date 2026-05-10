import { useCallback, type ClipboardEvent, type FormEvent, type KeyboardEvent, type MutableRefObject, type RefObject } from "react";
import { cx } from "../useEditorDocument";
import type { EditorDocumentNoteAlignOption, EditorDocumentNoteCommandItem } from "./editorDocumentNoteConstants";

type SyncNoteOptions = {
  snapshot?: boolean;
};

export type EditorDocumentNoteVariant = "desktop" | "mobile";

export type EditorDocumentNoteHookProps = {
  editorVariant?: EditorDocumentNoteVariant;
  noteEditorRef: RefObject<HTMLDivElement>;
  noteTextRef: MutableRefObject<string>;
  noteSelRangeRef: MutableRefObject<Range | null>;
  setNoteText: (html: string) => void;
  markDirty: () => void;
  scheduleNoteHistorySnapshot: (html: string) => void;
};

export function useEditorDocumentNote({
  editorVariant = "desktop",
  noteEditorRef,
  noteTextRef,
  noteSelRangeRef,
  setNoteText,
  markDirty,
  scheduleNoteHistorySnapshot,
}: EditorDocumentNoteHookProps) {
  const saveNoteSelection = useCallback(() => {
    const selection = window.getSelection?.();
    if (selection && selection.rangeCount > 0) {
      noteSelRangeRef.current = selection.getRangeAt(0).cloneRange();
    }
  }, [noteSelRangeRef]);

  const restoreNoteSelection = useCallback(() => {
    const selection = window.getSelection?.();
    if (!selection) return false;

    selection.removeAllRanges();
    if (noteSelRangeRef.current) {
      selection.addRange(noteSelRangeRef.current);
      return true;
    }

    return false;
  }, [noteSelRangeRef]);

  const syncNoteHtml = useCallback(
    (html: string, options: SyncNoteOptions = {}) => {
      noteTextRef.current = html;
      setNoteText(html);
      markDirty();
      if (options.snapshot) {
        scheduleNoteHistorySnapshot(html);
      }
    },
    [markDirty, noteTextRef, scheduleNoteHistorySnapshot, setNoteText],
  );

  const execNoteCommand = useCallback(
    (item: EditorDocumentNoteCommandItem) => {
      const editor = noteEditorRef.current;
      if (!editor) return false;

      editor.focus();
      restoreNoteSelection();

      if (item.isBlock) {
        const currentBlock = String(document.queryCommandValue("formatBlock") || "").toLowerCase();
        document.execCommand("formatBlock", false, currentBlock === item.cmd.toLowerCase() ? "p" : item.cmd);
      } else if (item.arg) {
        document.execCommand(item.cmd, false, item.arg);
      } else {
        document.execCommand(item.cmd, false);
      }

      const html = editor.innerHTML;
      syncNoteHtml(html, { snapshot: true });
      saveNoteSelection();
      return true;
    },
    [noteEditorRef, restoreNoteSelection, saveNoteSelection, syncNoteHtml],
  );

  const applyFontSize = useCallback(
    (pt: number) => {
      const editor = noteEditorRef.current;
      if (!editor) return false;

      editor.focus();
      const selection = window.getSelection?.();
      if (!selection || selection.rangeCount === 0 || selection.isCollapsed) return false;

      const range = selection.getRangeAt(0);
      const span = document.createElement("span");
      span.className = "editor-document-note__font-size-span";
      span.style.setProperty("--editor-document-note-font-size", `${pt}pt`);

      try {
        range.surroundContents(span);
      } catch (error) {
        const fragment = range.extractContents();
        span.appendChild(fragment);
        range.insertNode(span);
      }

      const nextRange = document.createRange();
      nextRange.selectNodeContents(span);
      selection.removeAllRanges();
      selection.addRange(nextRange);
      noteSelRangeRef.current = nextRange.cloneRange();

      syncNoteHtml(editor.innerHTML);
      return true;
    },
    [noteEditorRef, noteSelRangeRef, syncNoteHtml],
  );

  const applyNoteColor = useCallback(
    (color: string) => {
      const editor = noteEditorRef.current;
      if (!editor) return false;

      editor.focus();
      restoreNoteSelection();
      document.execCommand("foreColor", false, color);

      const html = editor.innerHTML;
      syncNoteHtml(html, { snapshot: true });
      return true;
    },
    [noteEditorRef, restoreNoteSelection, syncNoteHtml],
  );

  const applyAlignment = useCallback(
    (option: EditorDocumentNoteAlignOption) => {
      const editor = noteEditorRef.current;
      if (!editor) return false;

      editor.focus();
      restoreNoteSelection();
      document.execCommand(option.cmd, false);

      const html = editor.innerHTML;
      syncNoteHtml(html, { snapshot: true });
      saveNoteSelection();
      return true;
    },
    [noteEditorRef, restoreNoteSelection, saveNoteSelection, syncNoteHtml],
  );

  const handleEditorInput = useCallback(
    (event: FormEvent<HTMLDivElement>) => {
      const html = event.currentTarget.innerHTML;
      syncNoteHtml(html, { snapshot: true });
      saveNoteSelection();
    },
    [saveNoteSelection, syncNoteHtml],
  );

  const handleEditorKeyDown = useCallback(
    (event: KeyboardEvent<HTMLDivElement>) => {
      if (editorVariant !== "mobile" || event.key !== "Enter") return;
      event.preventDefault();
      document.execCommand("insertLineBreak");
    },
    [editorVariant],
  );

  const handleEditorPaste = useCallback((event: ClipboardEvent<HTMLDivElement>) => {
    if (editorVariant === "mobile") return;

    event.preventDefault();
    const text = event.clipboardData.getData("text/plain");
    document.execCommand("insertText", false, text);
  }, [editorVariant]);

  const noteClassName = cx("editor-document-note", `editor-document-note--${editorVariant}`);
  const editorClassName = cx(
    "ow-note-editor",
    "editor-document-note__editor",
    `editor-document-note__editor--${editorVariant}`,
  );

  return {
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
  };
}
