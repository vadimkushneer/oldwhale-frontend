/**
 * Note-mode toolbar data for {@link EditorDocumentNote}.
 */

export const NOTE_TOOLBAR_ITEMS = [
  { cmd: "bold", icon: "Ж", title: "Жирный", styleMod: "bold" },
  { cmd: "italic", icon: "К", title: "Курсив", styleMod: "italic" },
  { cmd: "underline", icon: "Ч", title: "Подчёркнутый", styleMod: "underline" },
  { cmd: "removeFormat", icon: "Н", title: "Убрать форматирование", tooltip: "Сбросить формат" },
  { sep: true },
  { cmd: "insertUnorderedList", icon: "•≡", title: "Список", compact: true },
  { cmd: "insertOrderedList", icon: "1≡", title: "Нумерованный список", compact: true },
  { sep: true },
  { cmd: "h1", icon: "H1", title: "Заголовок 1", isBlock: true, compact: true },
  { cmd: "h2", icon: "H2", title: "Заголовок 2", isBlock: true, compact: true },
  { cmd: "formatBlock", arg: "p", icon: "¶", title: "Обычный текст" },
];

export const NOTE_FONT_SIZES = [8, 10, 11, 12, 13, 14, 16, 18, 20, 24, 28, 32, 36];

export const NOTE_COLORS = [
  "#e8e4d8",
  "#f472b6",
  "#60a5fa",
  "#4ade80",
  "#fbbf24",
  "#a78bfa",
  "#f87171",
  "#34d399",
];

export const NOTE_ALIGN_OPTIONS = [
  { cmd: "justifyLeft", align: "left", label: "По левому краю" },
  { cmd: "justifyCenter", align: "center", label: "По центру" },
  { cmd: "justifyRight", align: "right", label: "По правому краю" },
] as const;

export type NoteAlignValue = (typeof NOTE_ALIGN_OPTIONS)[number]["align"];
