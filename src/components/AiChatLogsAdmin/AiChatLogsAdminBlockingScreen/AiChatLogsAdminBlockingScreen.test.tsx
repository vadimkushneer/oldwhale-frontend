import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { AiChatLogsAdminBlockingScreen } from "./AiChatLogsAdminBlockingScreen";

describe("AiChatLogsAdminBlockingScreen", () => {
  it("renders session restore copy", () => {
    render(<AiChatLogsAdminBlockingScreen variant="session-restore" />);
    expect(screen.getByText("ВОССТАНОВЛЕНИЕ СЕССИИ…")).toBeInTheDocument();
  });

  it("renders forbidden title and children", () => {
    render(
      <AiChatLogsAdminBlockingScreen variant="forbidden">
        <a href="/editor">link</a>
      </AiChatLogsAdminBlockingScreen>,
    );
    expect(screen.getByText("НЕДОСТАТОЧНО ПРАВ")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "link" })).toHaveAttribute("href", "/editor");
  });
});
