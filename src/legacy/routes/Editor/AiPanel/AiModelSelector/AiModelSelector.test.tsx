import { createRef } from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { AIM } from "../../../../domain/ai";
import { AiModelSelector } from "./AiModelSelector";

describe("AiModelSelector", () => {
  const rootRef = createRef<HTMLDivElement>();

  it("renders one row per model with heading", () => {
    render(
      <AiModelSelector
        models={AIM}
        activeModelId="deepseek"
        activeVariantId="x"
        menuOpen={false}
        rootRef={rootRef}
        onSelectProvider={vi.fn()}
        renderVariantPicker={() => <div data-testid="picker">picker</div>}
        getVariantLabel={() => "Label"}
      />,
    );
    expect(screen.getByText("ИИ МОДЕЛИ")).toBeInTheDocument();
    for (const m of AIM) {
      expect(screen.getByText(m.label)).toBeInTheDocument();
    }
  });

  it("marks active row with BEM modifier", () => {
    render(
      <AiModelSelector
        models={AIM}
        activeModelId="claude"
        activeVariantId="v1"
        menuOpen={false}
        rootRef={rootRef}
        onSelectProvider={vi.fn()}
        renderVariantPicker={() => null}
        getVariantLabel={() => "Opus"}
      />,
    );
    const activeBtn = screen.getByText("Claude").closest("button");
    expect(activeBtn?.className).toContain("ai-model-selector__row--active");
  });

  it("calls onSelectProvider with model id", () => {
    const onSelectProvider = vi.fn();
    render(
      <AiModelSelector
        models={AIM}
        activeModelId="deepseek"
        activeVariantId={undefined}
        menuOpen={false}
        rootRef={rootRef}
        onSelectProvider={onSelectProvider}
        renderVariantPicker={() => null}
        getVariantLabel={() => undefined}
      />,
    );
    screen.getByText("GPT").closest("button")?.click();
    expect(onSelectProvider).toHaveBeenCalledWith("gpt");
  });

  it("shows variant picker when expanded", () => {
    render(
      <AiModelSelector
        models={AIM}
        activeModelId="deepseek"
        activeVariantId="a"
        menuOpen
        rootRef={rootRef}
        onSelectProvider={vi.fn()}
        renderVariantPicker={() => <div data-testid="variant-picker">vp</div>}
        getVariantLabel={() => "V"}
      />,
    );
    expect(screen.getByTestId("variant-picker")).toBeInTheDocument();
  });

  it("rotates chevron when menu open", () => {
    render(
      <AiModelSelector
        models={AIM}
        activeModelId="deepseek"
        activeVariantId="a"
        menuOpen
        rootRef={rootRef}
        onSelectProvider={vi.fn()}
        renderVariantPicker={() => null}
        getVariantLabel={() => "V"}
      />,
    );
    const chevron = document.querySelector(".ai-model-selector__chevron--open");
    expect(chevron).toBeTruthy();
  });
});
