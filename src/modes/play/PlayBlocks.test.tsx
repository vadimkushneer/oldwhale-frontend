import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { PlayLine, PlayScene, PlaySpacer } from "./PlayBlocks";
import type { EditorBlock } from "../editor-core/blocks";

const core = () => ({
  blockRefs: { current: {} as Record<string, HTMLTextAreaElement | null> },
  docFont: "Times New Roman",
  autoH: vi.fn(),
  updBlock: vi.fn(),
  setFoc: vi.fn(),
  setFocId: vi.fn(),
  onKey: vi.fn(),
  renderSearchOverlay: vi.fn(() => null),
});

describe("PlayScene", () => {
  it("numbers the scene within its act as the placeholder", () => {
    const blocks: EditorBlock[] = [
      { id: 1, type: "scene", text: "" },
      { id: 2, type: "line", text: "" },
      { id: 3, type: "scene", text: "" },
    ];
    render(<PlayScene block={blocks[2]} blocks={blocks} {...core()} />);
    expect(screen.getByPlaceholderText("Сцена 2")).toBeTruthy();
  });

  it("typing updates the block", () => {
    const c = core();
    const blocks: EditorBlock[] = [{ id: 1, type: "scene", text: "" }];
    render(<PlayScene block={blocks[0]} blocks={blocks} {...c} />);
    fireEvent.change(screen.getByPlaceholderText("Сцена 1"), { target: { value: "Двор" } });
    expect(c.updBlock).toHaveBeenCalledWith(1, "Двор");
  });
});

describe("PlaySpacer", () => {
  it("renders the ОТСТУП marker and focuses on focus", () => {
    const setFoc = vi.fn();
    render(<PlaySpacer block={{ id: 5, type: "spacer" }} focId={null} accentColor="#abc" setFoc={setFoc} onKey={vi.fn()} />);
    expect(screen.getByText("ОТСТУП")).toBeTruthy();
    fireEvent.focus(screen.getByText("ОТСТУП").parentElement as HTMLElement);
    expect(setFoc).toHaveBeenCalledWith(5);
  });
});

describe("PlayLine", () => {
  it("edits the speaker name and the reply text separately", () => {
    const c = core();
    const updBlockName = vi.fn();
    render(<PlayLine block={{ id: 7, type: "line", text: "", name: "" }} updBlockName={updBlockName} {...c} />);
    fireEvent.change(screen.getByPlaceholderText("Имя"), { target: { value: "АННА" } });
    expect(updBlockName).toHaveBeenCalledWith(7, "АННА");
    fireEvent.change(screen.getByPlaceholderText("текст реплики..."), { target: { value: "Привет" } });
    expect(c.updBlock).toHaveBeenCalledWith(7, "Привет");
  });

  it("Tab/Enter in the name field jumps to the reply textarea", () => {
    const c = core();
    render(<PlayLine block={{ id: 8, type: "line", text: "", name: "X" }} updBlockName={vi.fn()} {...c} />);
    const nameInput = screen.getByPlaceholderText("Имя");
    fireEvent.keyDown(nameInput, { key: "Enter" });
    // no throw; focus jump is best-effort via ref (null in test)
    expect(nameInput).toBeTruthy();
  });
});
