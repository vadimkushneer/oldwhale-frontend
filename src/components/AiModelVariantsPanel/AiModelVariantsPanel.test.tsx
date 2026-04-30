import type { ComponentProps } from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { AiGroupAdmin, AiVariantAdmin } from "../../api/types";
import { AiModelVariantsPanel } from "./AiModelVariantsPanel";
import { reorderIdsMove } from "./useAiModelVariantsPanel";

const group: Pick<AiGroupAdmin, "id" | "label" | "slug"> = {
  id: 10,
  label: "OpenAI",
  slug: "openai",
};

function variant(overrides: Partial<AiVariantAdmin> = {}): AiVariantAdmin {
  return {
    id: 1,
    group_id: 10,
    slug: "gpt-4",
    label: "GPT 4",
    is_default: true,
    position: 1,
    created_at: "2026-01-01T00:00:00.000Z",
    ...overrides,
  };
}

function renderPanel(overrides: Partial<ComponentProps<typeof AiModelVariantsPanel>> = {}) {
  const onDragVariantIdChange = vi.fn();
  const onCreateVariant = vi.fn().mockResolvedValue(undefined);
  const onPatchVariant = vi.fn().mockResolvedValue(undefined);
  const onDeleteVariant = vi.fn().mockResolvedValue(undefined);
  const onReorderVariantIds = vi.fn().mockResolvedValue(undefined);

  render(
    <AiModelVariantsPanel
      group={group}
      variants={[
        variant(),
        variant({ id: 2, slug: "gpt-4o", label: "GPT 4o", is_default: false, position: 2 }),
      ]}
      busy={false}
      dragVariantId={null}
      onDragVariantIdChange={onDragVariantIdChange}
      onCreateVariant={onCreateVariant}
      onPatchVariant={onPatchVariant}
      onDeleteVariant={onDeleteVariant}
      onReorderVariantIds={onReorderVariantIds}
      confirmDelete={() => true}
      {...overrides}
    />,
  );

  return {
    onDragVariantIdChange,
    onCreateVariant,
    onPatchVariant,
    onDeleteVariant,
    onReorderVariantIds,
  };
}

describe("reorderIdsMove", () => {
  it("moves one id before another", () => {
    expect(reorderIdsMove([1, 2, 3], 2, 0)).toEqual([3, 1, 2]);
  });

  it("returns a shallow copy when indices are out of range", () => {
    const input = [1, 2, 3];
    const output = reorderIdsMove(input, -1, 1);

    expect(output).toEqual(input);
    expect(output).not.toBe(input);
  });
});

describe("AiModelVariantsPanel", () => {
  it("renders selected group metadata and variant rows", () => {
    renderPanel();

    expect(screen.getByText("OpenAI")).toBeInTheDocument();
    expect(screen.getByText(/\(openai\)/)).toBeInTheDocument();
    expect(screen.getByDisplayValue("gpt-4")).toBeInTheDocument();
    expect(screen.getByDisplayValue("GPT 4o")).toBeInTheDocument();
  });

  it("reorders variants with the selected group id", () => {
    const { onDragVariantIdChange, onReorderVariantIds } = renderPanel({ dragVariantId: 2 });
    const firstRow = screen.getByDisplayValue("gpt-4").closest(".ai-model-variant-row");

    expect(firstRow).not.toBeNull();
    fireEvent.drop(firstRow!);

    expect(onReorderVariantIds).toHaveBeenCalledWith(10, [2, 1]);
    expect(onDragVariantIdChange).toHaveBeenLastCalledWith(null);
  });

  it("creates a variant for the selected group", async () => {
    const { onCreateVariant } = renderPanel();

    fireEvent.change(screen.getByLabelText("Slug нового варианта"), {
      target: { value: " claude-3 " },
    });
    fireEvent.change(screen.getByLabelText("Label нового варианта"), {
      target: { value: "Claude 3" },
    });
    fireEvent.submit(screen.getByRole("button", { name: "+ ВАРИАНТ" }).closest("form")!);

    await waitFor(() => {
      expect(onCreateVariant).toHaveBeenCalledWith(10, {
        slug: "claude-3",
        label: "Claude 3",
      });
    });
  });
});
