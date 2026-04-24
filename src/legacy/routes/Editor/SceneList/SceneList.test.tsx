import type { ComponentProps } from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { act, render, fireEvent } from "@testing-library/react";
import { SceneList } from "./SceneList";
import type { SceneItem } from "./useSceneList";
import { SCENE_LIST_MOBILE_MEDIA } from "./useSceneList";

const SCENES: SceneItem[] = [
  { id: "act-1", kind: "act", actNum: 1, num: 1, text: "ACT I", index: 0 },
  { id: "sc-1", kind: "scene", actNum: 1, subNum: 1, num: 1, text: "Opening", index: 1 },
  { id: "sc-2", kind: "scene", actNum: 1, subNum: 2, num: 2, text: "Twist", index: 5 },
];

function setup(override?: Partial<ComponentProps<typeof SceneList>>) {
  const onGoToScene = vi.fn();
  const onSetActiveSceneId = vi.fn();
  const onToggleSceneSelect = vi.fn();
  const onToggleActSelect = vi.fn();
  const onDupScene = vi.fn();
  const onDelScene = vi.fn();
  const onMoveScene = vi.fn();

  const props = {
    scenes: SCENES,
    accent: "#7c6af7",
    mode: "film",
    activeSceneId: "sc-1" as string | null,
    selectedScenes: new Set<string>(),
    getSceneCardMetaById: () => ({}),
    getDesktopSceneCardMeta: () => ({
      cardMeta: {},
      castText: "",
      previewText: "",
      previewLines: 0,
    }),
    onGoToScene,
    onSetActiveSceneId,
    onToggleSceneSelect,
    onToggleActSelect,
    onDupScene,
    onDelScene,
    onMoveScene,
    ...override,
  };

  const view = render(<SceneList {...props} />);
  return { ...props, ...view, onGoToScene, onSetActiveSceneId, onToggleSceneSelect, onToggleActSelect, onDupScene, onDelScene, onMoveScene };
}

/** Toggle before `setup()` for mobile viewport behavior. */
let sceneListMobileMediaMatches = false;

describe("SceneList", () => {
  beforeEach(() => {
    sceneListMobileMediaMatches = false;
    vi.spyOn(window, "matchMedia").mockImplementation((query: string) => ({
      matches: query === SCENE_LIST_MOBILE_MEDIA ? sceneListMobileMediaMatches : false,
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));
    vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockImplementation(function (this: HTMLElement) {
      const id = this.getAttribute("data-scene-id");
      if (id === "sc-1") return { top: 100, bottom: 200, left: 0, right: 100, width: 100, height: 100, x: 0, y: 100 } as DOMRect;
      if (id === "sc-2") return { top: 200, bottom: 300, left: 0, right: 100, width: 100, height: 100, x: 0, y: 200 } as DOMRect;
      return { top: 0, bottom: 0, left: 0, right: 0, width: 0, height: 0, x: 0, y: 0 } as DOMRect;
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("sets theme CSS variables on root", () => {
    const { container } = setup();
    const root = container.querySelector(".scene-list") as HTMLElement;
    expect(root.style.getPropertyValue("--sl-accent")).toBe("#7c6af7");
    expect(root.style.getPropertyValue("--sl-bg")).toBeTruthy();
  });

  it("marks active scene card with modifier", () => {
    const { container } = setup();
    const card = container.querySelector('[data-scene-id="sc-1"]') as HTMLElement;
    expect(card.className).toContain("scene-list__card--active");
  });

  it("marks selected scene card with modifier", () => {
    const { container } = setup({ selectedScenes: new Set(["sc-2"]) });
    const card = container.querySelector('[data-scene-id="sc-2"]') as HTMLElement;
    expect(card.className).toContain("scene-list__card--selected");
  });

  it("calls onGoToScene when a scene row is clicked", () => {
    const { onGoToScene, container } = setup();
    const card = container.querySelector('[data-scene-id="sc-2"]') as HTMLElement;
    card.click();
    expect(onGoToScene).toHaveBeenCalledWith("sc-2");
  });

  it("calls onToggleSceneSelect when clicking a scene while multi-select is active", () => {
    const { onGoToScene, onToggleSceneSelect, container } = setup({
      selectedScenes: new Set(["sc-1"]),
    });
    const card = container.querySelector('[data-scene-id="sc-2"]') as HTMLElement;
    card.click();
    expect(onToggleSceneSelect).toHaveBeenCalledWith("sc-2");
    expect(onGoToScene).not.toHaveBeenCalled();
  });

  it("calls onSetActiveSceneId when clicking an act in film mode without multi-select", () => {
    const { onSetActiveSceneId, onGoToScene, container } = setup();
    const card = container.querySelector('[data-scene-id="act-1"]') as HTMLElement;
    card.click();
    expect(onSetActiveSceneId).toHaveBeenCalledWith("act-1");
    expect(onGoToScene).not.toHaveBeenCalled();
  });

  it("calls onToggleActSelect when clicking act checkbox while multi-select is active", () => {
    const { onToggleActSelect, container } = setup({ selectedScenes: new Set(["sc-1"]) });
    const checkbox = container.querySelector('[data-scene-id="act-1"] .scene-checkbox') as HTMLElement;
    checkbox.click();
    expect(onToggleActSelect).toHaveBeenCalledWith(1);
  });

  it("calls onDupScene and onDelScene from scene actions", () => {
    const { onDupScene, onDelScene, container } = setup();
    const dup = container.querySelector('[data-scene-id="sc-1"] .scene-item-card__btn--dup') as HTMLButtonElement;
    const del = container.querySelector('[data-scene-id="sc-1"] .scene-item-card__btn--del') as HTMLButtonElement;
    dup.click();
    del.click();
    expect(onDupScene).toHaveBeenCalledWith("sc-1");
    expect(onDelScene).toHaveBeenCalledWith("sc-1");
  });

  it("shows drop indicator when dragging over another scene", () => {
    const { container } = setup();
    const card1 = container.querySelector('[data-scene-id="sc-1"]') as HTMLElement;
    fireEvent.mouseDown(card1, { button: 0, clientY: 150, clientX: 50 });
    fireEvent(document, new MouseEvent("mousemove", { bubbles: true, clientY: 250, clientX: 50 }));
    const card2 = container.querySelector('[data-scene-id="sc-2"]') as HTMLElement;
    const item2 = card2.closest(".scene-list__item");
    const indicator = item2?.querySelector(".scene-list__drop-indicator") as HTMLElement;
    expect(indicator?.className).toContain("scene-list__drop-indicator--visible");
  });

  it("applies dragging modifier to source card while drag active", () => {
    const { container } = setup();
    const card1 = container.querySelector('[data-scene-id="sc-1"]') as HTMLElement;
    fireEvent.mouseDown(card1, { button: 0, clientY: 150, clientX: 50 });
    fireEvent(document, new MouseEvent("mousemove", { bubbles: true, clientY: 250, clientX: 50 }));
    expect(card1.className).toContain("scene-list__card--dragging");
  });

  it("renders ghost with expected CSS variables after drag starts", () => {
    const { container } = setup();
    const card1 = container.querySelector('[data-scene-id="sc-1"]') as HTMLElement;
    vi.spyOn(card1, "offsetHeight", "get").mockReturnValue(80);
    fireEvent.mouseDown(card1, { button: 0, clientY: 150, clientX: 100 });
    fireEvent(document, new MouseEvent("mousemove", { bubbles: true, clientY: 200, clientX: 120 }));
    const ghost = container.querySelector(".scene-list__ghost") as HTMLElement;
    expect(ghost).toBeTruthy();
    expect(ghost.style.getPropertyValue("--sl-ghost-x")).toBe("30px");
    expect(ghost.style.getPropertyValue("--sl-ghost-y")).toBe("160px");
  });

  it("calls onMoveScene on mouseup after drag onto another scene", () => {
    const { onMoveScene, container } = setup();
    const card1 = container.querySelector('[data-scene-id="sc-1"]') as HTMLElement;
    fireEvent.mouseDown(card1, { button: 0, clientY: 150, clientX: 50 });
    fireEvent(document, new MouseEvent("mousemove", { bubbles: true, clientY: 250, clientX: 50 }));
    fireEvent(document, new MouseEvent("mouseup", { bubbles: true }));
    expect(onMoveScene).toHaveBeenCalledWith("sc-1", "sc-2");
  });

  it("mobile: long press reveals scene actions then auto-hides", () => {
    vi.useFakeTimers();
    sceneListMobileMediaMatches = true;
    const { container } = setup();
    const row = container.querySelector('[data-scene-id="sc-1"]')!.closest(".scene-list__item") as HTMLElement;
    expect(row.className).not.toContain("scene-list__item--scene-actions-open");

    fireEvent.pointerDown(row, { button: 0, clientX: 50, clientY: 150, bubbles: true });
    act(() => {
      vi.advanceTimersByTime(799);
    });
    expect(row.className).not.toContain("scene-list__item--scene-actions-open");
    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(row.className).toContain("scene-list__item--scene-actions-open");

    act(() => {
      vi.advanceTimersByTime(800);
    });
    expect(row.className).not.toContain("scene-list__item--scene-actions-open");
    vi.useRealTimers();
  });

  it("mobile: suppresses next shell click after long press", () => {
    vi.useFakeTimers();
    sceneListMobileMediaMatches = true;
    const { onGoToScene, container } = setup();
    const shell = container.querySelector('[data-scene-id="sc-1"]') as HTMLElement;
    const row = shell.closest(".scene-list__item") as HTMLElement;

    fireEvent.pointerDown(row, { button: 0, clientX: 50, clientY: 150, bubbles: true });
    act(() => {
      vi.advanceTimersByTime(800);
    });
    fireEvent.pointerUp(row, { button: 0, bubbles: true });
    shell.click();
    expect(onGoToScene).not.toHaveBeenCalled();

    shell.click();
    expect(onGoToScene).toHaveBeenCalledWith("sc-1");
    vi.useRealTimers();
  });

  it("mobile: pointerdown outside open row closes actions", () => {
    vi.useFakeTimers();
    sceneListMobileMediaMatches = true;
    const { container } = setup();
    const row = container.querySelector('[data-scene-id="sc-1"]')!.closest(".scene-list__item") as HTMLElement;
    fireEvent.pointerDown(row, { button: 0, clientX: 50, clientY: 150, bubbles: true });
    act(() => {
      vi.advanceTimersByTime(800);
    });
    expect(row.className).toContain("scene-list__item--scene-actions-open");

    const listRoot = container.querySelector(".scene-list") as HTMLElement;
    fireEvent.pointerDown(listRoot, { button: 0, clientX: 5, clientY: 5, bubbles: true });
    expect(row.className).not.toContain("scene-list__item--scene-actions-open");
    vi.useRealTimers();
  });
});
