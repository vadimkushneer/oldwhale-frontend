import type { ComponentProps } from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { AiModelVariantCreateForm } from "./AiModelVariantCreateForm";

function renderForm(overrides: Partial<ComponentProps<typeof AiModelVariantCreateForm>> = {}) {
  const onCreateVariant = vi.fn().mockResolvedValue(undefined);

  render(
    <AiModelVariantCreateForm
      busy={false}
      onCreateVariant={onCreateVariant}
      {...overrides}
    />,
  );

  return { onCreateVariant };
}

describe("AiModelVariantCreateForm", () => {
  it("validates the slug before creating a variant", () => {
    const { onCreateVariant } = renderForm();

    fireEvent.change(screen.getByLabelText("Slug нового варианта"), {
      target: { value: "a" },
    });
    fireEvent.submit(screen.getByRole("button", { name: "+ ВАРИАНТ" }).closest("form")!);

    expect(screen.getByText("slug варианта ≥2")).toBeInTheDocument();
    expect(onCreateVariant).not.toHaveBeenCalled();
  });

  it("creates a variant and clears inputs", async () => {
    const { onCreateVariant } = renderForm();
    const slugInput = screen.getByLabelText("Slug нового варианта");
    const labelInput = screen.getByLabelText("Label нового варианта");

    fireEvent.change(slugInput, { target: { value: " gpt-4o " } });
    fireEvent.change(labelInput, { target: { value: "GPT 4o" } });
    fireEvent.submit(screen.getByRole("button", { name: "+ ВАРИАНТ" }).closest("form")!);

    await waitFor(() => {
      expect(onCreateVariant).toHaveBeenCalledWith({
        slug: "gpt-4o",
        label: "GPT 4o",
      });
    });
    expect(slugInput).toHaveValue("");
    expect(labelInput).toHaveValue("");
  });

  it("renders API errors returned from create", async () => {
    renderForm({
      onCreateVariant: vi.fn().mockRejectedValue({ data: { error: "slug already exists" } }),
    });

    fireEvent.change(screen.getByLabelText("Slug нового варианта"), {
      target: { value: "gpt-4o" },
    });
    fireEvent.submit(screen.getByRole("button", { name: "+ ВАРИАНТ" }).closest("form")!);

    expect(await screen.findByText("slug already exists")).toBeInTheDocument();
  });

  it("disables submit while busy", () => {
    renderForm({ busy: true });

    expect(screen.getByRole("button", { name: "+ ВАРИАНТ" })).toBeDisabled();
  });
});
