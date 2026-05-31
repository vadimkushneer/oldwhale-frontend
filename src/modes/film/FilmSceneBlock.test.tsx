import { createRef } from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { FilmSceneBlock } from "./FilmSceneBlock";
import type { EditorBlock } from "../editor-core/blocks";

function setup(overrides: Partial<EditorBlock> = {}) {
  const block: EditorBlock = { id: 1, type: "scene", text: "ИНТ. КУХНЯ. ДЕНЬ.", ...overrides };
  const blocks: EditorBlock[] = [block, { id: 2, type: "cast", text: "" }];
  const onFocusBlock = vi.fn();
  const onBlurBlock = vi.fn();
  const onUpdateBlock = vi.fn();
  const blockRefs = createRef<Record<string, HTMLElement | null>>() as {
    current: Record<string, HTMLElement | null>;
  };
  blockRefs.current = {};
  render(
    <FilmSceneBlock
      block={block}
      blocks={blocks}
      blockRefs={blockRefs}
      onFocusBlock={onFocusBlock}
      onBlurBlock={onBlurBlock}
      onUpdateBlock={onUpdateBlock}
    />,
  );
  return { onFocusBlock, onBlurBlock, onUpdateBlock };
}

describe("FilmSceneBlock", () => {
  it("parses the heading into INT/EXT, location, and time", () => {
    setup();
    expect(screen.getByText("ИНТ.")).toBeTruthy();
    expect(screen.getByText("НАТ.")).toBeTruthy();
    expect((screen.getByPlaceholderText("ЛОКАЦИЯ") as HTMLInputElement).value).toBe("КУХНЯ");
    expect(screen.getByText("ДЕНЬ")).toBeTruthy();
  });

  it("clicking НАТ rewrites the heading with the new INT/EXT and focuses the block", () => {
    const { onUpdateBlock, onFocusBlock } = setup();
    fireEvent.click(screen.getByText("НАТ."));
    expect(onFocusBlock).toHaveBeenCalledWith(1);
    expect(onUpdateBlock).toHaveBeenCalledWith(1, "НАТ. КУХНЯ. ДЕНЬ.");
  });

  it("editing the location upper-cases it into the heading", () => {
    const { onUpdateBlock } = setup();
    fireEvent.change(screen.getByPlaceholderText("ЛОКАЦИЯ"), { target: { value: "склад" } });
    expect(onUpdateBlock).toHaveBeenCalledWith(1, "ИНТ. СКЛАД. ДЕНЬ.");
  });

  it("clicking a time chip rewrites the time portion", () => {
    const { onUpdateBlock } = setup();
    fireEvent.click(screen.getByText("НОЧЬ"));
    expect(onUpdateBlock).toHaveBeenCalledWith(1, "ИНТ. КУХНЯ. НОЧЬ.");
  });

  it("blur notifies the parent", () => {
    const { onBlurBlock } = setup();
    fireEvent.blur(screen.getByPlaceholderText("ЛОКАЦИЯ"));
    expect(onBlurBlock).toHaveBeenCalledWith(1);
  });
});
