import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { EditorDocumentNoteAlignControl } from "./EditorDocumentNoteAlignControl";

describe("EditorDocumentNoteAlignControl", () => {
  it("opens alignment options and applies the selected alignment", () => {
    const applyAlignment = vi.fn().mockReturnValue(true);

    render(<EditorDocumentNoteAlignControl applyAlignment={applyAlignment} />);

    fireEvent.mouseDown(screen.getByTitle("Выравнивание"));
    fireEvent.mouseDown(screen.getByText("По центру"));

    expect(applyAlignment).toHaveBeenCalledWith(
      expect.objectContaining({ cmd: "justifyCenter", align: "center" }),
    );
    expect(screen.queryByText("По центру")).not.toBeInTheDocument();
  });

  it("keeps the menu open when alignment cannot be applied", () => {
    render(<EditorDocumentNoteAlignControl applyAlignment={vi.fn().mockReturnValue(false)} />);

    fireEvent.mouseDown(screen.getByTitle("Выравнивание"));
    fireEvent.mouseDown(screen.getByText("По правому краю"));

    expect(screen.getByText("По правому краю")).toBeInTheDocument();
  });
});
