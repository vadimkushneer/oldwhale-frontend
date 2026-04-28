import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { defaultColumnVisibility } from "../aiChatLogsAdminQuery";
import { AiChatLogsAdminColumnBar } from "./AiChatLogsAdminColumnBar";

describe("AiChatLogsAdminColumnBar", () => {
  it("toggles column visibility", () => {
    const onToggleColumn = vi.fn();
    render(
      <AiChatLogsAdminColumnBar
        columnVisibility={defaultColumnVisibility()}
        onToggleColumn={onToggleColumn}
      />,
    );
    fireEvent.click(screen.getByRole("checkbox", { name: "ID" }));
    expect(onToggleColumn).toHaveBeenCalledWith("id");
  });

  it("marks hidden columns with hidden modifier class", () => {
    const cols = { ...defaultColumnVisibility(), id: false };
    const { container } = render(
      <AiChatLogsAdminColumnBar columnVisibility={cols} onToggleColumn={vi.fn()} />,
    );
    expect(container.querySelector(".ai-chat-logs-admin-column-bar__item--hidden")).not.toBeNull();
    expect(container.querySelector(".ai-chat-logs-admin-column-bar__item--visible")).not.toBeNull();
  });
});
