import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MarkerContextMenu } from "./MarkerContextMenu";

const MENU = {
  x: 900,
  y: 400,
  blockId: "b1",
  sliceStart: 0,
  start: 1,
  end: 5,
};

const COLORS = [null, "#c8a96e", "#f0a030"] as const;

describe("MarkerContextMenu", () => {
  const execCommandMock = vi.fn(() => true);

  beforeEach(() => {
    Object.defineProperty(document, "execCommand", {
      value: execCommandMock,
      configurable: true,
      writable: true,
    });
  });

  afterEach(() => {
    execCommandMock.mockClear();
    Reflect.deleteProperty(document, "execCommand");
  });

  it("returns null when menu is null", () => {
    const { container } = render(
      <MarkerContextMenu
        menu={null}
        colors={COLORS}
        accent="#7c6af7"
        onApplyColor={vi.fn()}
        onDismiss={vi.fn()}
      />,
    );
    expect(container.firstChild).toBeNull();
  });

  it("clamps position to viewport", () => {
    vi.stubGlobal("innerWidth", 400);
    vi.stubGlobal("innerHeight", 300);
    const { container } = render(
      <MarkerContextMenu
        menu={{ ...MENU, x: 1000, y: 500 }}
        colors={COLORS}
        accent="#7c6af7"
        onApplyColor={vi.fn()}
        onDismiss={vi.fn()}
      />,
    );
    const card = container.querySelector(".marker-context-menu__card") as HTMLElement;
    expect(card.style.getPropertyValue("--mcm-left")).toBe("190px");
    expect(card.style.getPropertyValue("--mcm-top")).toBe("120px");
    vi.unstubAllGlobals();
  });

  it("calls onApplyColor when swatch clicked", () => {
    const onApplyColor = vi.fn();
    render(
      <MarkerContextMenu
        menu={MENU}
        colors={COLORS}
        accent="#7c6af7"
        onApplyColor={onApplyColor}
        onDismiss={vi.fn()}
      />,
    );
    const swatches = document.querySelectorAll(".marker-context-menu__swatch");
    (swatches[1] as HTMLButtonElement).click();
    expect(onApplyColor).toHaveBeenCalledWith("#c8a96e");
  });

  it("calls onApplyColor(null) for clear swatch", () => {
    const onApplyColor = vi.fn();
    render(
      <MarkerContextMenu
        menu={MENU}
        colors={COLORS}
        accent="#7c6af7"
        onApplyColor={onApplyColor}
        onDismiss={vi.fn()}
      />,
    );
    screen.getByTitle("Стереть").click();
    expect(onApplyColor).toHaveBeenCalledWith(null);
  });

  it("runs execCommand and dismisses on clipboard actions", () => {
    const onDismiss = vi.fn();
    render(
      <MarkerContextMenu
        menu={MENU}
        colors={COLORS}
        accent="#7c6af7"
        onApplyColor={vi.fn()}
        onDismiss={onDismiss}
      />,
    );
    screen.getByText("Копировать").click();
    expect(execCommandMock).toHaveBeenCalledWith("copy");
    expect(onDismiss).toHaveBeenCalled();
  });

  it("dismisses on backdrop mousedown", () => {
    const onDismiss = vi.fn();
    const { container } = render(
      <MarkerContextMenu
        menu={MENU}
        colors={COLORS}
        accent="#7c6af7"
        onApplyColor={vi.fn()}
        onDismiss={onDismiss}
      />,
    );
    fireEvent.mouseDown(container.querySelector(".marker-context-menu__backdrop") as HTMLElement);
    expect(onDismiss).toHaveBeenCalled();
  });

  it("dismisses on close button", () => {
    const onDismiss = vi.fn();
    render(
      <MarkerContextMenu
        menu={MENU}
        colors={COLORS}
        accent="#7c6af7"
        onApplyColor={vi.fn()}
        onDismiss={onDismiss}
      />,
    );
    screen.getByRole("button", { name: "Закрыть" }).click();
    expect(onDismiss).toHaveBeenCalled();
  });
});
