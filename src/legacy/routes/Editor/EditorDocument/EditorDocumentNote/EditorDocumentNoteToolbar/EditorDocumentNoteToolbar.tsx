import { EditorDocumentNoteAlignControl } from "../EditorDocumentNoteAlignControl/EditorDocumentNoteAlignControl";
import { EditorDocumentNoteColorPicker } from "../EditorDocumentNoteColorPicker/EditorDocumentNoteColorPicker";
import { EditorDocumentNoteFontSizeControl } from "../EditorDocumentNoteFontSizeControl/EditorDocumentNoteFontSizeControl";
import {
  NOTE_STRUCTURE_FORMAT_ITEMS,
  NOTE_TEXT_FORMAT_ITEMS,
  type EditorDocumentNoteAlignOption,
  type EditorDocumentNoteCommandItem,
  type EditorDocumentNoteToolbarEntry,
} from "../editorDocumentNoteConstants";
import { useEditorDocumentNoteToolbar } from "./useEditorDocumentNoteToolbar";
import "./EditorDocumentNoteToolbar.scss";

export type EditorDocumentNoteToolbarProps = {
  execNoteCommand: (item: EditorDocumentNoteCommandItem) => boolean;
  applyNoteColor: (color: string) => boolean;
  applyAlignment: (option: EditorDocumentNoteAlignOption) => boolean;
  applyFontSize: (fontSize: number) => boolean;
  saveNoteSelection: () => void;
  restoreNoteSelection: () => boolean;
  getTooltipAnchorProps: (label: string) => Record<string, any>;
};

export function EditorDocumentNoteToolbar({
  execNoteCommand,
  applyNoteColor,
  applyAlignment,
  applyFontSize,
  saveNoteSelection,
  restoreNoteSelection,
  getTooltipAnchorProps,
}: EditorDocumentNoteToolbarProps) {
  const { getCommandClassName, getCommandMouseDownHandler, getCommandTitle, getCommandTooltipProps } =
    useEditorDocumentNoteToolbar({
      execNoteCommand,
      getTooltipAnchorProps,
    });

  const renderCommand = (item: EditorDocumentNoteCommandItem) => (
    <button
      key={item.id}
      type="button"
      {...getCommandTooltipProps(item)}
      title={getCommandTitle(item)}
      className={getCommandClassName(item)}
      onMouseDown={getCommandMouseDownHandler(item)}
    >
      {item.icon}
    </button>
  );

  const renderStructureEntry = (entry: EditorDocumentNoteToolbarEntry) => {
    if ("kind" in entry && entry.kind === "separator") {
      return <div key={entry.id} className="editor-document-note-toolbar__separator" />;
    }

    return renderCommand(entry as EditorDocumentNoteCommandItem);
  };

  return (
    <div className="editor-document-note-toolbar" role="toolbar" aria-label="Форматирование заметки">
      {NOTE_TEXT_FORMAT_ITEMS.map(renderCommand)}

      <EditorDocumentNoteColorPicker
        applyNoteColor={applyNoteColor}
        saveNoteSelection={saveNoteSelection}
        getTooltipAnchorProps={getTooltipAnchorProps}
      />

      {NOTE_STRUCTURE_FORMAT_ITEMS.map(renderStructureEntry)}

      <div className="editor-document-note-toolbar__separator" />

      <EditorDocumentNoteAlignControl applyAlignment={applyAlignment} />

      <div className="editor-document-note-toolbar__separator" />

      <EditorDocumentNoteFontSizeControl
        applyFontSize={applyFontSize}
        saveNoteSelection={saveNoteSelection}
        restoreNoteSelection={restoreNoteSelection}
      />
    </div>
  );
}
