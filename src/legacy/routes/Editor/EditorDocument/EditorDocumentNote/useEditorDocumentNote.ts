import { useCallback, useState } from "react";
import type { ClipboardEvent, Dispatch, FormEvent, MutableRefObject, RefObject, SetStateAction } from "react";
import { diffWords } from "diff";
import { NOTE_TOOLBAR_ITEMS } from "../editorDocumentNoteConstants";

type ToolbarItem = (typeof NOTE_TOOLBAR_ITEMS)[number];

interface PasteReview {
  originalHtml: string;
  proposedHtml: string;
  originalText: string;
  proposedText: string;
  diffHtml: string;
  isLong: boolean;
  changes: Array<{ id: number; removed: string; added: string }>;
}

function escapeHtml(str: string): string {
  return str.replace(/[&<>"']/g, (m) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[m]!));
}

function getPlainText(input: string | HTMLElement): string {
  const div = document.createElement("div");
  if (typeof input === "string") {
    div.innerHTML = input;
  } else {
    div.innerHTML = input.innerHTML;
  }
  return div.textContent || "";
}

/**
 * Pure function to compute granular text changes between two strings.
 * Used by paste review and for unit testing that we get multiple small changes
 * instead of one huge replacement.
 */
export function computeTextChanges(original: string, proposed: string) {
  const parts = diffWords(original, proposed);
  const changes: Array<{ id: number; removed: string; added: string }> = [];
  let changeId = 0;
  let pendingRemoved = "";
  let diffHtml = "";
  parts.forEach((part) => {
    if (part.added) {
      diffHtml += `<span class="diff-added">${escapeHtml(part.value)}</span>`;
      changes.push({ id: changeId++, removed: pendingRemoved, added: part.value });
      pendingRemoved = "";
    } else if (part.removed) {
      diffHtml += `<span class="diff-removed">${escapeHtml(part.value)}</span>`;
      pendingRemoved = part.value;
    } else {
      diffHtml += escapeHtml(part.value);
      if (pendingRemoved) {
        // lone removal without immediate addition
        changes.push({ id: changeId++, removed: pendingRemoved, added: "" });
        pendingRemoved = "";
      }
    }
  });
  if (pendingRemoved) {
    changes.push({ id: changeId++, removed: pendingRemoved, added: "" });
  }
  return { changes, diffHtml };
}

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
  const [review, setReview] = useState<PasteReview | null>(null);

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

  const onPaste = useCallback(
    (e: ClipboardEvent<HTMLDivElement>) => {
      e.preventDefault();
      const editor = noteEditorRef.current;
      if (!editor) return;

      const pastedPlain = e.clipboardData.getData("text/plain").replace(/\r\n/g, "\n");
      if (!pastedPlain.trim()) {
        return;
      }

      const originalHtml = editor.innerHTML;
      const originalText = getPlainText(editor);

      // fast path for short pastes or short notes (keeps existing behavior & tests)
      if (pastedPlain.length < 30 || originalText.length < 20) {
        document.execCommand("insertText", false, pastedPlain);
        return;
      }
      const sel = window.getSelection();
      const selectedText = sel && sel.rangeCount > 0 ? sel.toString() : "";

      let proposedText: string;
      if (selectedText) {
        const idx = originalText.indexOf(selectedText);
        if (idx !== -1) {
          proposedText = originalText.slice(0, idx) + pastedPlain + originalText.slice(idx + selectedText.length);
        } else {
          proposedText = originalText + pastedPlain;
        }
      } else {
        // caret or no selection: append with newline separator for clarity
        proposedText = originalText ? `${originalText}\n${pastedPlain}` : pastedPlain;
      }

      // selection-aware diff using jsdiff on the affected text region
      // Delegate to the shared computeTextChanges helper for both granular changes and diff HTML
      const { changes, diffHtml } = computeTextChanges(originalText, proposedText);

      const proposedHtml = proposedText.replace(/\n/g, "<br>");
      const isLong = proposedText.length > 400 || (proposedText.match(/\n/g) || []).length > 4;

      setReview({
        originalHtml,
        proposedHtml,
        originalText,
        proposedText,
        diffHtml,
        isLong,
        changes,
      });
    },
    [noteEditorRef],
  );

  const acceptDiff = useCallback(
    (finalProposedHtml?: string) => {
      if (!review || !noteEditorRef.current) return;
      const htmlToUse = finalProposedHtml || review.proposedHtml;
      noteEditorRef.current.innerHTML = htmlToUse;
      syncNoteHtml(htmlToUse, { snapshot: true });
      setReview(null);
    },
    [review, syncNoteHtml],
  );

  const declineDiff = useCallback(() => {
    if (!review || !noteEditorRef.current) return;
    noteEditorRef.current.innerHTML = review.originalHtml;
    setReview(null);
  }, [review]);

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
    isReviewing: !!review,
    reviewData: review,
    acceptDiff,
    declineDiff,
  };
}
