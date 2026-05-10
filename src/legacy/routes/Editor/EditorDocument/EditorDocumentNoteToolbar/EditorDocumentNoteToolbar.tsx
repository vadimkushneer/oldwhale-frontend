import type { Dispatch, MutableRefObject, RefObject, SetStateAction } from "react";
import type { NoteAlignValue } from "../editorDocumentNoteConstants";
import { NOTE_TOOLBAR_ITEMS } from "../editorDocumentNoteConstants";
import { EditorDocumentNoteAlignControl } from "../EditorDocumentNoteAlignControl/EditorDocumentNoteAlignControl";
import { EditorDocumentNoteColorPicker } from "../EditorDocumentNoteColorPicker/EditorDocumentNoteColorPicker";
import { EditorDocumentNoteFontSizeControl } from "../EditorDocumentNoteFontSizeControl/EditorDocumentNoteFontSizeControl";
import { useEditorDocumentNoteToolbar } from "./useEditorDocumentNoteToolbar";
import "./EditorDocumentNoteToolbar.scss";

type ToolbarItem = (typeof NOTE_TOOLBAR_ITEMS)[number];

export type EditorDocumentNoteToolbarProps = {
  getTooltipAnchorProps: (label: string) => Record<string, unknown>;
  execNoteCommand: (item: ToolbarItem) => void;
  saveNoteSelection: () => void;
  applyNoteColor: (color: string) => void;
  noteColorOpen: boolean;
  setNoteColorOpen: Dispatch<SetStateAction<boolean>>;
  noteEditorRef: RefObject<HTMLDivElement | null>;
  noteTextRef: MutableRefObject<string>;
  setNoteText: (html: string) => void;
  markDirty: () => void;
  scheduleNoteHistorySnapshot: (html: string) => void;
  restoreNoteSelection: () => boolean;
  noteAlignOpen: boolean;
  setNoteAlignOpen: Dispatch<SetStateAction<boolean>>;
  noteAlign: NoteAlignValue;
  setNoteAlign: (value: NoteAlignValue) => void;
  noteFontSize: number;
  setNoteFontSize: (value: number) => void;
  noteSelRangeRef: MutableRefObject<Range | null>;
  applyFontSize: (pt: number) => void;
};

export function EditorDocumentNoteToolbar({
  getTooltipAnchorProps,
  execNoteCommand,
  saveNoteSelection,
  applyNoteColor,
  noteColorOpen,
  setNoteColorOpen,
  noteEditorRef,
  noteTextRef,
  setNoteText,
  markDirty,
  scheduleNoteHistorySnapshot,
  restoreNoteSelection,
  noteAlignOpen,
  setNoteAlignOpen,
  noteAlign,
  setNoteAlign,
  noteFontSize,
  setNoteFontSize,
  noteSelRangeRef,
  applyFontSize,
}: EditorDocumentNoteToolbarProps) {
  const c = useEditorDocumentNoteToolbar();

  return (
    <div className={c.rootClassName}>
      {NOTE_TOOLBAR_ITEMS.slice(0, 4).map((item, index) =>
        "sep" in item && item.sep ? (
          <div key={`note-sep-${index}`} className={c.separatorClassName} />
        ) : (
          <button
            key={"cmd" in item ? item.cmd : index}
            type="button"
            {...("tooltip" in item && item.tooltip ? getTooltipAnchorProps(item.tooltip) : {})}
            title={"tooltip" in item && item.tooltip ? undefined : "title" in item ? item.title : undefined}
            className={c.buttonClassName({
              compact: "compact" in item && Boolean(item.compact),
              styleMod: "styleMod" in item && item.styleMod ? String(item.styleMod) : undefined,
            })}
            onMouseDown={(e) => {
              e.preventDefault();
              execNoteCommand(item);
            }}
          >
            {"icon" in item ? item.icon : null}
          </button>
        ),
      )}

      <EditorDocumentNoteColorPicker
        isOpen={noteColorOpen}
        onToggleOpen={() => setNoteColorOpen((value) => !value)}
        onClose={() => setNoteColorOpen(false)}
        getTooltipAnchorProps={getTooltipAnchorProps}
        saveNoteSelection={saveNoteSelection}
        applyNoteColor={applyNoteColor}
      />

      {NOTE_TOOLBAR_ITEMS.slice(4).map((item, index) =>
        "sep" in item && item.sep ? (
          <div key={`note-tail-sep-${index}`} className={c.separatorClassName} />
        ) : (
          <button
            key={`note-tail-${"cmd" in item ? item.cmd : index}`}
            type="button"
            title={"title" in item ? item.title : undefined}
            className={c.buttonClassName({
              compact: "compact" in item && Boolean(item.compact),
              styleMod: "styleMod" in item && item.styleMod ? String(item.styleMod) : undefined,
            })}
            onMouseDown={(e) => {
              e.preventDefault();
              execNoteCommand(item);
            }}
          >
            {"icon" in item ? item.icon : null}
          </button>
        ),
      )}

      <div className={c.separatorClassName} />

      <EditorDocumentNoteAlignControl
        noteEditorRef={noteEditorRef}
        noteTextRef={noteTextRef}
        setNoteText={setNoteText}
        markDirty={markDirty}
        scheduleNoteHistorySnapshot={scheduleNoteHistorySnapshot}
        saveNoteSelection={saveNoteSelection}
        restoreNoteSelection={restoreNoteSelection}
        alignOpen={noteAlignOpen}
        setAlignOpen={setNoteAlignOpen}
        align={noteAlign}
        setAlign={setNoteAlign}
      />

      <div className={c.separatorClassName} />

      <EditorDocumentNoteFontSizeControl
        noteFontSize={noteFontSize}
        setNoteFontSize={setNoteFontSize}
        noteSelRangeRef={noteSelRangeRef}
        saveNoteSelection={saveNoteSelection}
        applyFontSize={applyFontSize}
      />
    </div>
  );
}
