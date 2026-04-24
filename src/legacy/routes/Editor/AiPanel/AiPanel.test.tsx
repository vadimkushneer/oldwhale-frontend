import { createRef } from "react";
import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { AIM } from "../../../domain/ai";
import { AiPanel } from "./AiPanel";

describe("AiPanel", () => {
  const modelMenuRootRef = createRef<HTMLDivElement>();
  const msgEndRef = createRef<HTMLDivElement>();

  const defaultProps = {
    width: 320,
    sidebarWidth: 320,
    onWidthChange: vi.fn(),
    onCollapse: vi.fn(),
    composerHeight: 120,
    onComposerHeightChange: vi.fn(),
    models: AIM,
    activeModelId: "deepseek",
    activeVariantId: "deepseek-v3-2",
    modelMenuOpen: false,
    modelMenuRootRef,
    onSelectProvider: vi.fn(),
    renderVariantPicker: () => null,
    getVariantLabel: () => "V3.2",
    messages: [{ role: "sys", text: "Hi" }],
    loading: false,
    messagesEndRef: msgEndRef,
    getProviderColor: () => "#4ade80",
    composer: <div data-testid="composer-slot">composer</div>,
    creditsLabel: "БЕСПЛАТНО",
    previewOverlay: <div data-testid="preview">pv</div>,
    tooltip: <div data-testid="tooltip">tip</div>,
    accent: "#4ade80",
  };

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("projects sidebar width as CSS variable on root", () => {
    const { container } = render(<AiPanel {...defaultProps} />);
    const root = container.querySelector(".ai-panel") as HTMLElement;
    expect(root.style.getPropertyValue("--ap-sidebar-w")).toBe("320px");
  });

  it("calls onCollapse when collapse tab is clicked", async () => {
    const onCollapse = vi.fn();
    render(<AiPanel {...defaultProps} onCollapse={onCollapse} />);
    screen.getByTitle("Свернуть ИИ-панель").click();
    expect(onCollapse).toHaveBeenCalledTimes(1);
  });

  it("renders composer, preview, and tooltip slots", () => {
    render(<AiPanel {...defaultProps} />);
    expect(screen.getByTestId("composer-slot")).toBeInTheDocument();
    expect(screen.getByTestId("preview")).toBeInTheDocument();
    expect(screen.getByTestId("tooltip")).toBeInTheDocument();
  });

  it("clamps width on horizontal resize drag", () => {
    const onWidthChange = vi.fn();
    render(<AiPanel {...defaultProps} width={400} onWidthChange={onWidthChange} />);
    const resizer = document.querySelector(".ai-panel__resizer") as HTMLElement;
    fireEvent.mouseDown(resizer, { clientX: 100 });
    fireEvent(window, new MouseEvent("mousemove", { bubbles: true, clientX: 500 }));
    fireEvent(window, new MouseEvent("mouseup", { bubbles: true }));
    expect(onWidthChange).toHaveBeenCalled();
    const last = onWidthChange.mock.calls.at(-1)?.[0] as number;
    expect(last).toBeGreaterThanOrEqual(200);
    expect(last).toBeLessThanOrEqual(590);
  });

  it("clamps composer height on vertical grip drag", () => {
    vi.stubGlobal(
      "visualViewport",
      Object.assign(new EventTarget(), { height: 800, width: 1024, offsetTop: 0, offsetLeft: 0, scale: 1 }),
    );
    const onComposerHeightChange = vi.fn();
    render(
      <AiPanel {...defaultProps} composerHeight={100} onComposerHeightChange={onComposerHeightChange} />,
    );
    const grip = document.querySelector(".ai-panel__composer-grip") as HTMLElement;
    fireEvent.mouseDown(grip, { clientY: 200 });
    fireEvent(window, new MouseEvent("mousemove", { bubbles: true, clientY: 100 }));
    fireEvent(window, new MouseEvent("mouseup", { bubbles: true }));
    expect(onComposerHeightChange).toHaveBeenCalled();
    const last = onComposerHeightChange.mock.calls.at(-1)?.[0] as number;
    expect(last).toBeGreaterThanOrEqual(56);
    expect(last).toBeLessThanOrEqual(400);
    vi.unstubAllGlobals();
  });

  it("assigns messagesEndRef to anchor element", () => {
    render(<AiPanel {...defaultProps} />);
    expect(msgEndRef.current).toBeInstanceOf(HTMLDivElement);
    expect(msgEndRef.current?.className).toContain("ai-message-list__end-anchor");
  });
});
