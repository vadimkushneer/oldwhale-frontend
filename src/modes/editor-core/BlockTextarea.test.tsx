import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { BlockTextarea, type BlockTextareaProps } from "./BlockTextarea";

function setup(over: Partial<BlockTextareaProps> = {}) {
  const props: BlockTextareaProps = {
    block: { id: 1, type: "action", text: "hello" },
    defs: [
      { type: "action", ph: "Действие", spell: true },
      { type: "char", ph: "Персонаж", spell: false },
    ],
    mode: "film",
    blockRefs: { current: {} },
    spellOn: true,
    autoH: vi.fn(),
    updBlock: vi.fn(),
    setFoc: vi.fn(),
    setFocId: vi.fn(),
    onKey: vi.fn(),
    uid: (() => {
      let n = 100;
      return () => ++n;
    })(),
    setBlocks: vi.fn(),
    markDirty: vi.fn(),
    renderSearchOverlay: vi.fn(() => null),
    ...over,
  };
  render(<BlockTextarea {...props} />);
  return props;
}

describe("BlockTextarea", () => {
  it("renders the block text and placeholder from the def", () => {
    setup();
    const ta = screen.getByPlaceholderText("Действие") as HTMLTextAreaElement;
    expect(ta.value).toBe("hello");
  });

  it("typing calls updBlock and autosize", () => {
    const props = setup();
    const ta = screen.getByPlaceholderText("Действие");
    fireEvent.change(ta, { target: { value: "world" } });
    expect(props.updBlock).toHaveBeenCalledWith(1, "world");
    expect(props.autoH).toHaveBeenCalled();
  });

  it("upper-cases input for cast/char/scene blocks", () => {
    const props = setup({ block: { id: 2, type: "char", text: "" } });
    fireEvent.change(screen.getByPlaceholderText("Персонаж"), { target: { value: "anna" } });
    expect(props.updBlock).toHaveBeenCalledWith(2, "ANNA");
  });

  it("forwards keydown to onKey with the block", () => {
    const props = setup();
    fireEvent.keyDown(screen.getByPlaceholderText("Действие"), { key: "Enter" });
    expect(props.onKey).toHaveBeenCalled();
    expect((props.onKey as ReturnType<typeof vi.fn>).mock.calls[0][1]).toMatchObject({ id: 1 });
  });

  it("registers itself in the blockRefs map", () => {
    const props = setup();
    expect(props.blockRefs.current[1]).toBeTruthy();
  });

  it("invokes the search-overlay render-prop for this block", () => {
    const props = setup();
    expect(props.renderSearchOverlay).toHaveBeenCalledWith(
      expect.objectContaining({ scope: "block", blockId: 1, text: "hello" }),
    );
  });
});
