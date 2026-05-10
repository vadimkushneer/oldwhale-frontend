import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { EditorDocumentNoteToolbar } from "./EditorDocumentNoteToolbar";

function renderToolbar(overrides: Record<string, any> = {}) {
  const props = {
    execNoteCommand: vi.fn().mockReturnValue(true),
    applyNoteColor: vi.fn().mockReturnValue(true),
    applyAlignment: vi.fn().mockReturnValue(true),
    applyFontSize: vi.fn().mockReturnValue(true),
    saveNoteSelection: vi.fn(),
    restoreNoteSelection: vi.fn().mockReturnValue(true),
    getTooltipAnchorProps: (label: string) => ({ "data-tooltip": label }),
    ...overrides,
  };

  render(<EditorDocumentNoteToolbar {...props} />);
  return props;
}

describe("EditorDocumentNoteToolbar", () => {
  it("renders semantic toolbar groups without positional slicing", () => {
    renderToolbar();

    expect(screen.getByRole("toolbar", { name: "Форматирование заметки" })).toBeInTheDocument();
    expect(screen.getByTitle("Жирный")).toHaveTextContent("Ж");
    expect(screen.getByTitle("Список")).toHaveTextContent("•≡");
    expect(screen.getByTitle("Заголовок 1")).toHaveTextContent("H1");
    expect(screen.getByTitle("Обычный текст")).toHaveTextContent("¶");
  });

  it("executes note commands and wires tooltip anchors", () => {
    const props = renderToolbar();

    fireEvent.mouseDown(screen.getByTitle("Жирный"));
    fireEvent.mouseDown(screen.getByTitle("Заголовок 1"));

    expect(props.execNoteCommand).toHaveBeenNthCalledWith(1, expect.objectContaining({ cmd: "bold" }));
    expect(props.execNoteCommand).toHaveBeenNthCalledWith(2, expect.objectContaining({ cmd: "h1", isBlock: true }));
    expect(screen.getByText("Н")).toHaveAttribute("data-tooltip", "Сбросить формат");
  });

  it("delegates color, alignment, and font-size interactions to dedicated controls", () => {
    const props = renderToolbar();

    fireEvent.mouseDown(screen.getByRole("button", { name: "" }));
    fireEvent.mouseDown(screen.getByLabelText("Мятный"));
    fireEvent.mouseDown(screen.getByTitle("Выравнивание"));
    fireEvent.mouseDown(screen.getByText("По правому краю"));
    fireEvent.mouseDown(screen.getByText("+"));

    expect(props.applyNoteColor).toHaveBeenCalledWith("#34d399");
    expect(props.applyAlignment).toHaveBeenCalledWith(expect.objectContaining({ align: "right" }));
    expect(props.applyFontSize).toHaveBeenCalledWith(15);
  });
});
