import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AiSelectionActionBar } from "./AiSelectionActionBar";

describe("AiSelectionActionBar", () => {
  it("renders nothing when no messages are selected", () => {
    const { container } = render(
      <AiSelectionActionBar selectedCount={0} onDeleteSelected={vi.fn()} onCancel={vi.fn()} />,
    );

    expect(container.querySelector(".ai-selection-action-bar")).toBeNull();
  });

  it("renders actions when messages are selected", () => {
    render(<AiSelectionActionBar selectedCount={2} onDeleteSelected={vi.fn()} onCancel={vi.fn()} />);

    expect(screen.getByText("Выбрано: 2")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Удалить" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Отмена" })).toBeInTheDocument();
  });

  it("calls action handlers", async () => {
    const user = userEvent.setup();
    const onDeleteSelected = vi.fn();
    const onCancel = vi.fn();
    render(
      <AiSelectionActionBar selectedCount={1} onDeleteSelected={onDeleteSelected} onCancel={onCancel} />,
    );

    await user.click(screen.getByRole("button", { name: "Удалить" }));
    await user.click(screen.getByRole("button", { name: "Отмена" }));

    expect(onDeleteSelected).toHaveBeenCalledTimes(1);
    expect(onCancel).toHaveBeenCalledTimes(1);
  });
});
