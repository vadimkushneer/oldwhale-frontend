import { createRef } from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AiModelSelector } from "./AiModelSelector";

const BACKEND_MODELS = [
  { id: "alpha", label: "Alpha", role: "Черновик", free: true },
  { id: "beta", label: "Beta", role: "Идеи", free: false },
];

const VARIANTS_BY_PROVIDER = {
  alpha: [
    { id: "a", label: "Alpha A" },
    { id: "b", label: "Alpha B" },
  ],
  beta: [{ id: "v1", label: "Beta One" }],
};

describe("AiModelSelector", () => {
  const rootRef = createRef<HTMLDivElement>();

  it("renders one row per model with heading", () => {
    render(
      <AiModelSelector
        models={BACKEND_MODELS}
        activeModelId="alpha"
        activeVariantId="x"
        menuOpen={false}
        rootRef={rootRef}
        onSelectProvider={vi.fn()}
        onSelectVariant={vi.fn()}
        variantsByProvider={VARIANTS_BY_PROVIDER}
        getVariantLabel={() => "Label"}
      />,
    );
    expect(screen.getByText("ИИ МОДЕЛИ")).toBeInTheDocument();
    for (const m of BACKEND_MODELS) {
      expect(screen.getByText(m.label)).toBeInTheDocument();
    }
    expect(screen.queryByText("DeepSeek")).not.toBeInTheDocument();
  });

  it("marks active row with BEM modifier", () => {
    render(
      <AiModelSelector
        models={BACKEND_MODELS}
        activeModelId="beta"
        activeVariantId="v1"
        menuOpen={false}
        rootRef={rootRef}
        onSelectProvider={vi.fn()}
        onSelectVariant={vi.fn()}
        variantsByProvider={VARIANTS_BY_PROVIDER}
        getVariantLabel={() => "Opus"}
      />,
    );
    const activeBtn = screen.getByText("Beta").closest("button");
    expect(activeBtn?.className).toContain("ai-model-selector__row--active");
  });

  it("calls onSelectProvider with model id", () => {
    const onSelectProvider = vi.fn();
    render(
      <AiModelSelector
        models={BACKEND_MODELS}
        activeModelId="alpha"
        activeVariantId={undefined}
        menuOpen={false}
        rootRef={rootRef}
        onSelectProvider={onSelectProvider}
        onSelectVariant={vi.fn()}
        variantsByProvider={VARIANTS_BY_PROVIDER}
        getVariantLabel={() => undefined}
      />,
    );
    screen.getByText("Beta").closest("button")?.click();
    expect(onSelectProvider).toHaveBeenCalledWith("beta");
  });

  it("shows variant picker when expanded", () => {
    render(
      <AiModelSelector
        models={BACKEND_MODELS}
        activeModelId="alpha"
        activeVariantId="a"
        menuOpen
        rootRef={rootRef}
        onSelectProvider={vi.fn()}
        onSelectVariant={vi.fn()}
        variantsByProvider={VARIANTS_BY_PROVIDER}
        getVariantLabel={() => "V"}
      />,
    );
    expect(screen.getByText("Alpha A")).toBeInTheDocument();
    expect(document.querySelector(".ai-model-variant-picker")).toBeTruthy();
  });

  it("rotates chevron when menu open", () => {
    render(
      <AiModelSelector
        models={BACKEND_MODELS}
        activeModelId="alpha"
        activeVariantId="a"
        menuOpen
        rootRef={rootRef}
        onSelectProvider={vi.fn()}
        onSelectVariant={vi.fn()}
        variantsByProvider={VARIANTS_BY_PROVIDER}
        getVariantLabel={() => "V"}
      />,
    );
    const chevron = document.querySelector(".ai-model-selector__chevron--open");
    expect(chevron).toBeTruthy();
  });

  it("folds and expands the model list from the section heading", async () => {
    const user = userEvent.setup();
    const { container } = render(
      <AiModelSelector
        models={BACKEND_MODELS}
        activeModelId="alpha"
        activeVariantId={undefined}
        menuOpen={false}
        rootRef={rootRef}
        onSelectProvider={vi.fn()}
        onSelectVariant={vi.fn()}
        variantsByProvider={VARIANTS_BY_PROVIDER}
        getVariantLabel={() => undefined}
      />,
    );
    const sectionToggle = screen.getByRole("button", {
      name: "Список ИИ-моделей: показать или скрыть",
    });
    const list = container.querySelector(".ai-model-selector__list");
    expect(list).toBeTruthy();
    expect(list).not.toHaveAttribute("hidden");
    await user.click(sectionToggle);
    expect(list).toHaveAttribute("hidden");
    expect(sectionToggle).toHaveAttribute("aria-expanded", "false");
    await user.click(sectionToggle);
    expect(list).not.toHaveAttribute("hidden");
    expect(sectionToggle).toHaveAttribute("aria-expanded", "true");
  });
});
