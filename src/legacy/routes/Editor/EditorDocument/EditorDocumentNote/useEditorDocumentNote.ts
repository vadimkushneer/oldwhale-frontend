import { useCallback } from "react";
import type { ClipboardEvent, Dispatch, FormEvent, MutableRefObject, RefObject, SetStateAction } from "react";
import { NOTE_TOOLBAR_ITEMS } from "../editorDocumentNoteConstants";

type ToolbarItem = (typeof NOTE_TOOLBAR_ITEMS)[number];

export type UseEditorDocumentNoteArgs = {
  noteEditorRef: RefObject<HTMLDivElement | null>;
  noteTextRef: MutableRefObject<string>;
  noteSelRangeRef: MutableRefObject<Range | null>;
  setNoteText: (html: string) => void;
  markDirty: () => void;
  scheduleNoteHistorySnapshot: (html: string) => void;
  setNoteColorOpen: Dispatch<SetStateAction<boolean>>;
};

export function useEditorDocumentNote({
  noteEditorRef,
  noteTextRef,
  noteSelRangeRef,
  setNoteText,
  markDirty,
  scheduleNoteHistorySnapshot,
  setNoteColorOpen,
}: UseEditorDocumentNoteArgs) {
  const saveNoteSelection = useCallback(() => {
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0) noteSelRangeRef.current = sel.getRangeAt(0).cloneRange();
  }, [noteSelRangeRef]);

  const restoreNoteSelection = useCallback(() => {
    const sel = window.getSelection();
    if (!sel) return false;

    sel.removeAllRanges();
    if (noteSelRangeRef.current) {
      sel.addRange(noteSelRangeRef.current);
      return true;
    }

    return false;
  }, [noteSelRangeRef]);

  const syncNoteHtml = useCallback(
    (html: string, options: { snapshot?: boolean } = {}) => {
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
    (item: ToolbarItem) => {
      const editor = noteEditorRef.current;
      if (!editor || !("cmd" in item)) return;
      const command = item.cmd;
      if (!command) return;

      editor.focus();
      restoreNoteSelection();

      if ("isBlock" in item && item.isBlock) {
        const currentBlock = String(document.queryCommandValue("formatBlock") || "").toLowerCase();
        document.execCommand("formatBlock", false, currentBlock === command.toLowerCase() ? "p" : command);
      } else {
        document.execCommand(command, false, ("arg" in item ? item.arg || null : null) as string);
      }

      const html = editor.innerHTML;
      syncNoteHtml(html, { snapshot: true });
      saveNoteSelection();
    },
    [noteEditorRef, restoreNoteSelection, saveNoteSelection, syncNoteHtml],
  );

  const applyFontSize = useCallback(
    (pt: number) => {
      const editor = noteEditorRef.current;
      if (!editor) return;

      editor.focus();
      const sel = window.getSelection();
      if (!sel || sel.rangeCount === 0 || sel.isCollapsed) return;

      const range = sel.getRangeAt(0);
      const span = document.createElement("span");
      span.style.fontSize = `${pt}pt`;

      try {
        range.surroundContents(span);
      } catch {
        const frag = range.extractContents();
        span.appendChild(frag);
        range.insertNode(span);
      }

      const nextRange = document.createRange();
      nextRange.selectNodeContents(span);
      sel.removeAllRanges();
      sel.addRange(nextRange);
      noteSelRangeRef.current = nextRange.cloneRange();

      syncNoteHtml(editor.innerHTML);
    },
    [noteEditorRef, noteSelRangeRef, syncNoteHtml],
  );

  const applyNoteColor = useCallback(
    (color: string) => {
      const editor = noteEditorRef.current;
      if (!editor) return;

      editor.focus();
      restoreNoteSelection();
      document.execCommand("foreColor", false, color);

      const html = editor.innerHTML;
      syncNoteHtml(html, { snapshot: true });
      setNoteColorOpen(false);
    },
    [noteEditorRef, restoreNoteSelection, setNoteColorOpen, syncNoteHtml],
  );

  const onInput = useCallback(
    (e: FormEvent<HTMLDivElement>) => {
      const html = e.currentTarget.innerHTML;
      syncNoteHtml(html, { snapshot: true });
      saveNoteSelection();
    },
    [saveNoteSelection, syncNoteHtml],
  );

  const onPaste = useCallback((e: ClipboardEvent<HTMLDivElement>) => {
    e.preventDefault();
    const text = e.clipboardData.getData("text/plain");
    document.execCommand("insertText", false, text);
  }, []);

  return {
    onInput,
    onPaste,
    onFocus: saveNoteSelection,
    onKeyUp: saveNoteSelection,
    onMouseUp: saveNoteSelection,
    saveNoteSelection,
    restoreNoteSelection,
    execNoteCommand,
    applyFontSize,
    applyNoteColor,
  };
}
