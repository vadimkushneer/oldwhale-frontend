export type EditorDocumentNoteCommandItem = {
  id: string;
  cmd: string;
  arg?: string;
  icon: string;
  title: string;
  tooltip?: string;
  isBlock?: boolean;
  compact?: boolean;
  styleMod?: "bold" | "italic" | "underline";
};

export type EditorDocumentNoteToolbarEntry =
  | EditorDocumentNoteCommandItem
  | {
      id: string;
      kind: "separator";
    };

export type EditorDocumentNoteColor = {
  id: string;
  value: string;
  label: string;
};

export type EditorDocumentNoteAlignment = "left" | "center" | "right";

export type EditorDocumentNoteAlignOption = {
  cmd: string;
  align: EditorDocumentNoteAlignment;
  label: string;
};

export const NOTE_DEFAULT_FONT_SIZE = 14;
export const NOTE_MIN_FONT_SIZE = 4;
export const NOTE_MAX_FONT_SIZE = 96;

export const NOTE_TEXT_FORMAT_ITEMS: EditorDocumentNoteCommandItem[] = [
  { id: "bold", cmd: "bold", icon: "Ж", title: "Жирный", styleMod: "bold" },
  { id: "italic", cmd: "italic", icon: "К", title: "Курсив", styleMod: "italic" },
  { id: "underline", cmd: "underline", icon: "Ч", title: "Подчёркнутый", styleMod: "underline" },
  { id: "remove-format", cmd: "removeFormat", icon: "Н", title: "Убрать форматирование", tooltip: "Сбросить формат" },
];

export const NOTE_STRUCTURE_FORMAT_ITEMS: EditorDocumentNoteToolbarEntry[] = [
  { id: "list-divider", kind: "separator" },
  { id: "unordered-list", cmd: "insertUnorderedList", icon: "•≡", title: "Список", compact: true },
  { id: "ordered-list", cmd: "insertOrderedList", icon: "1≡", title: "Нумерованный список", compact: true },
  { id: "heading-divider", kind: "separator" },
  { id: "heading-one", cmd: "h1", icon: "H1", title: "Заголовок 1", isBlock: true, compact: true },
  { id: "heading-two", cmd: "h2", icon: "H2", title: "Заголовок 2", isBlock: true, compact: true },
  { id: "paragraph", cmd: "formatBlock", arg: "p", icon: "¶", title: "Обычный текст" },
];

export const NOTE_COLORS: EditorDocumentNoteColor[] = [
  { id: "paper", value: "#e8e4d8", label: "Светлый" },
  { id: "pink", value: "#f472b6", label: "Розовый" },
  { id: "blue", value: "#60a5fa", label: "Синий" },
  { id: "green", value: "#4ade80", label: "Зелёный" },
  { id: "amber", value: "#fbbf24", label: "Жёлтый" },
  { id: "violet", value: "#a78bfa", label: "Фиолетовый" },
  { id: "red", value: "#f87171", label: "Красный" },
  { id: "mint", value: "#34d399", label: "Мятный" },
];

export const NOTE_ALIGN_OPTIONS: EditorDocumentNoteAlignOption[] = [
  { cmd: "justifyLeft", align: "left", label: "По левому краю" },
  { cmd: "justifyCenter", align: "center", label: "По центру" },
  { cmd: "justifyRight", align: "right", label: "По правому краю" },
];

type TranslateFn = (key: string, options?: { defaultValue?: string }) => string;

export function getTranslatedNoteTextFormatItems(t: TranslateFn): EditorDocumentNoteCommandItem[] {
  return NOTE_TEXT_FORMAT_ITEMS.map((item) => ({
    ...item,
    title: t(`note.format.${item.id === "remove-format" ? "removeFormat" : item.id}`, { defaultValue: item.title }),
    tooltip: item.tooltip
      ? t("note.format.resetFormat", { defaultValue: item.tooltip })
      : undefined,
  }));
}

export function getTranslatedNoteStructureFormatItems(t: TranslateFn): EditorDocumentNoteToolbarEntry[] {
  return NOTE_STRUCTURE_FORMAT_ITEMS.map((entry) => {
    if ("kind" in entry && entry.kind === "separator") return entry;
    const item = entry as EditorDocumentNoteCommandItem;
    const keyMap: Record<string, string> = {
      "unordered-list": "list",
      "ordered-list": "orderedList",
      "heading-one": "heading1",
      "heading-two": "heading2",
      paragraph: "paragraph",
    };
    const key = keyMap[item.id] || item.id;
    return {
      ...item,
      title: t(`note.format.${key}`, { defaultValue: item.title }),
    };
  });
}

export function getTranslatedNoteColors(t: TranslateFn): EditorDocumentNoteColor[] {
  return NOTE_COLORS.map((color) => ({
    ...color,
    label: t(`note.colors.${color.id}`, { defaultValue: color.label }),
  }));
}

export function getTranslatedNoteAlignOptions(t: TranslateFn): EditorDocumentNoteAlignOption[] {
  return NOTE_ALIGN_OPTIONS.map((option) => ({
    ...option,
    label: t(`note.align.${option.align}`, { defaultValue: option.label }),
  }));
}
