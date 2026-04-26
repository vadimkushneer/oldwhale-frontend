import { useState, type ComponentProps } from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { EditorTopBar } from "./EditorTopBar";

type EditorTopBarComponentProps = ComponentProps<typeof EditorTopBar>;

function makeProps(overrides: Partial<EditorTopBarComponentProps> = {}): EditorTopBarComponentProps {
  return {
    mode: "play",
    stats: {
      timing: "02:00",
      pages: 2,
      words: 245,
      chars: 1234,
    },
    saved: false,
    sheetOn: false,
    zoom: 100,
    aiOpen: false,
    accent: "#f472b6",
    onToggleSheet: vi.fn(),
    onUndo: vi.fn(),
    onRedo: vi.fn(),
    onZoomOut: vi.fn(),
    onZoomIn: vi.fn(),
    onToggleAi: vi.fn(),
    ...overrides,
  };
}

describe("EditorTopBar", () => {
  it("renders the current mode badge and all document stats", () => {
    render(<EditorTopBar {...makeProps()} />);

    expect(screen.getByText("ПЬЕСА")).toBeInTheDocument();
    expect(screen.getByText("ХРН.")).toBeInTheDocument();
    expect(screen.getByText("02:00")).toBeInTheDocument();
    expect(screen.getByText("СТР.")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();
    expect(screen.getByText("СЛОВ")).toBeInTheDocument();
    expect(screen.getByText("245")).toBeInTheDocument();
    expect(screen.getByText("СИМВ.")).toBeInTheDocument();
    expect(screen.getByText("1234")).toBeInTheDocument();
  });

  it("applies state and accent modifier classes", () => {
    const { container } = render(
      <EditorTopBar
        {...makeProps({
          saved: true,
          sheetOn: true,
          aiOpen: true,
          accent: "#4ade80",
        })}
      />,
    );

    expect(container.querySelector(".editor-top-bar--accent-green")).toBeTruthy();
    expect(container.querySelector(".editor-top-bar__save-status--saved")).toBeTruthy();
    expect(container.querySelector(".editor-top-bar__save-dot--saved")).toBeTruthy();
    expect(container.querySelector(".editor-top-bar__sheet-toggle--active")).toBeTruthy();
    expect(container.querySelector(".editor-top-bar__ai-toggle--open")).toBeTruthy();
  });

  it("fires sheet, history, zoom, and AI callbacks", () => {
    const props = makeProps();
    render(<EditorTopBar {...props} />);

    fireEvent.click(screen.getByRole("button", { name: "Показать лист" }));
    fireEvent.click(screen.getByRole("button", { name: "Отменить" }));
    fireEvent.click(screen.getByRole("button", { name: "Повторить" }));
    fireEvent.click(screen.getByRole("button", { name: "Уменьшить масштаб" }));
    fireEvent.click(screen.getByRole("button", { name: "Увеличить масштаб" }));
    fireEvent.click(screen.getByRole("button", { name: "ИИ ◀" }));

    expect(props.onToggleSheet).toHaveBeenCalledTimes(1);
    expect(props.onUndo).toHaveBeenCalledTimes(1);
    expect(props.onRedo).toHaveBeenCalledTimes(1);
    expect(props.onZoomOut).toHaveBeenCalledTimes(1);
    expect(props.onZoomIn).toHaveBeenCalledTimes(1);
    expect(props.onToggleAi).toHaveBeenCalledTimes(1);
  });

  it("supports the clamped zoom wiring used by the editor screen", () => {
    function ZoomHarness() {
      const [zoom, setZoom] = useState(50);

      return (
        <EditorTopBar
          {...makeProps({
            zoom,
            onZoomOut: () => setZoom((value) => Math.max(50, value - 10)),
            onZoomIn: () => setZoom((value) => Math.min(200, value + 10)),
          })}
        />
      );
    }

    render(<ZoomHarness />);

    fireEvent.click(screen.getByRole("button", { name: "Уменьшить масштаб" }));
    expect(screen.getByText("50%")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Увеличить масштаб" }));
    expect(screen.getByText("60%")).toBeInTheDocument();
  });

  it("falls back to the default violet accent modifier for unknown colors", () => {
    const { container } = render(<EditorTopBar {...makeProps({ accent: "#123456" })} />);

    expect(container.querySelector(".editor-top-bar--accent-violet")).toBeTruthy();
  });
});
