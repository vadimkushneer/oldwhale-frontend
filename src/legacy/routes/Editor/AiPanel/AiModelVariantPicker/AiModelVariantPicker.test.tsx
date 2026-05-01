import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AiModelVariantPicker } from "./AiModelVariantPicker";

const VARIANTS = [
  { id: "opus", label: "Claude Opus" },
  { id: "sonnet", label: "Claude Sonnet" },
];

describe("AiModelVariantPicker", () => {
  it("renders every variant label", () => {
    render(
      <AiModelVariantPicker
        providerId="claude"
        variants={VARIANTS}
        activeModelId="claude"
        activeVariantId="opus"
        onSelectVariant={vi.fn()}
      />,
    );

    expect(screen.getByText("Claude Opus")).toBeInTheDocument();
    expect(screen.getByText("Claude Sonnet")).toBeInTheDocument();
  });

  it("marks the active variant with a BEM modifier and status label", () => {
    render(
      <AiModelVariantPicker
        providerId="claude"
        variants={VARIANTS}
        activeModelId="claude"
        activeVariantId="opus"
        onSelectVariant={vi.fn()}
      />,
    );

    const activeButton = screen.getByText("Claude Opus").closest("button");
    expect(activeButton?.className).toContain("ai-model-variant-picker__option--active");
    expect(screen.getByText("ВЫБРАНО")).toBeInTheDocument();
  });

  it("calls onSelectVariant with provider and variant ids", async () => {
    const user = userEvent.setup();
    const onSelectVariant = vi.fn();
    render(
      <AiModelVariantPicker
        providerId="claude"
        variants={VARIANTS}
        activeModelId="claude"
        activeVariantId="opus"
        onSelectVariant={onSelectVariant}
      />,
    );

    await user.click(screen.getByText("Claude Sonnet"));
    expect(onSelectVariant).toHaveBeenCalledWith("claude", "sonnet");
  });

  it("renders the compact modifier when requested", () => {
    const { container } = render(
      <AiModelVariantPicker
        providerId="claude"
        variants={VARIANTS}
        activeModelId="claude"
        activeVariantId="opus"
        compact
        onSelectVariant={vi.fn()}
      />,
    );

    expect(container.querySelector(".ai-model-variant-picker--compact")).toBeTruthy();
  });
});
