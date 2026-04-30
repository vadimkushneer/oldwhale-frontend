import type { ComponentProps } from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { AiVariantAdmin } from "../../api/types";
import { AiModelVariantRow } from "./AiModelVariantRow";

function variant(overrides: Partial<AiVariantAdmin> = {}): AiVariantAdmin {
  return {
    id: 7,
    guid: "11111111-1111-4111-8111-111111111111",
    group_id: 3,
    slug: "gpt-4",
    label: "GPT 4",
    is_default: false,
    position: 1,
    created_at: "2026-01-01T00:00:00.000Z",
    ...overrides,
  };
}

function renderRow(overrides: Partial<ComponentProps<typeof AiModelVariantRow>> = {}) {
  const onDragVariantIdChange = vi.fn();
  const onReorderVariantIds = vi.fn();
  const onPatchVariant = vi.fn();
  const onDeleteVariant = vi.fn();
  const confirmDelete = vi.fn(() => true);
  const rowVariant = overrides.variant ?? variant();

  render(
    <AiModelVariantRow
      groupId={3}
      variant={rowVariant}
      busy={false}
      orderedVariantIds={[7, 8, 9]}
      dragVariantId={null}
      onDragVariantIdChange={onDragVariantIdChange}
      onReorderVariantIds={onReorderVariantIds}
      onPatchVariant={onPatchVariant}
      onDeleteVariant={onDeleteVariant}
      confirmDelete={confirmDelete}
      {...overrides}
    />,
  );

  return {
    confirmDelete,
    onDragVariantIdChange,
    onReorderVariantIds,
    onPatchVariant,
    onDeleteVariant,
  };
}

describe("AiModelVariantRow", () => {
  it("patches the variant when slug changes on blur", () => {
    const { onPatchVariant } = renderRow();
    const slugInput = screen.getByLabelText("Slug варианта");

    fireEvent.change(slugInput, { target: { value: " gpt-4-turbo " } });
    fireEvent.blur(slugInput);

    expect(onPatchVariant).toHaveBeenCalledWith(7, { slug: "gpt-4-turbo" });
  });

  it("does not patch an empty slug", () => {
    const { onPatchVariant } = renderRow();
    const slugInput = screen.getByLabelText("Slug варианта");

    fireEvent.change(slugInput, { target: { value: " " } });
    fireEvent.blur(slugInput);

    expect(onPatchVariant).not.toHaveBeenCalled();
  });

  it("patches the variant label when label changes on blur", () => {
    const { onPatchVariant } = renderRow();
    const labelInput = screen.getByLabelText("Label варианта");

    fireEvent.change(labelInput, { target: { value: "GPT 4 Turbo" } });
    fireEvent.blur(labelInput);

    expect(onPatchVariant).toHaveBeenCalledWith(7, { label: "GPT 4 Turbo" });
  });

  it("marks a variant as default from the DEF button", () => {
    const { onPatchVariant } = renderRow();

    fireEvent.click(screen.getByRole("button", { name: "DEF" }));

    expect(onPatchVariant).toHaveBeenCalledWith(7, { is_default: true });
  });

  it("confirms and deletes a variant", () => {
    const { confirmDelete, onDeleteVariant } = renderRow();

    fireEvent.click(screen.getByRole("button", { name: "Удалить вариант gpt-4" }));

    expect(confirmDelete).toHaveBeenCalledWith(expect.objectContaining({ id: 7 }));
    expect(onDeleteVariant).toHaveBeenCalledWith(7);
  });

  it("does not delete when confirmation is declined", () => {
    const { onDeleteVariant } = renderRow({ confirmDelete: () => false });

    fireEvent.click(screen.getByRole("button", { name: "Удалить вариант gpt-4" }));

    expect(onDeleteVariant).not.toHaveBeenCalled();
  });

  it("starts drag only when row is not busy", () => {
    const { onDragVariantIdChange } = renderRow();

    fireEvent.dragStart(screen.getByDisplayValue("gpt-4").closest(".ai-model-variant-row")!);

    expect(onDragVariantIdChange).toHaveBeenCalledWith(7);
  });

  it("does not start drag when busy", () => {
    const { onDragVariantIdChange } = renderRow({ busy: true });
    const row = screen.getByDisplayValue("gpt-4").closest(".ai-model-variant-row");

    expect(row).toHaveAttribute("draggable", "false");
    fireEvent.dragStart(row!);

    expect(onDragVariantIdChange).not.toHaveBeenCalled();
  });

  it("reorders on drop and clears the active drag id", () => {
    const { onDragVariantIdChange, onReorderVariantIds } = renderRow({
      dragVariantId: 9,
      orderedVariantIds: [7, 8, 9],
    });

    fireEvent.drop(screen.getByDisplayValue("gpt-4").closest(".ai-model-variant-row")!);

    expect(onReorderVariantIds).toHaveBeenCalledWith([9, 7, 8]);
    expect(onDragVariantIdChange).toHaveBeenLastCalledWith(null);
  });
});
