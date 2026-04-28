import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { AiChatLogsAdminToolbar } from "./AiChatLogsAdminToolbar";

function renderToolbar() {
  return render(
    <MemoryRouter>
      <AiChatLogsAdminToolbar />
    </MemoryRouter>,
  );
}

describe("AiChatLogsAdminToolbar", () => {
  it("renders title and navigation links", () => {
    renderToolbar();
    expect(screen.getByText("АДМИН · ЖУРНАЛ ИИ‑ЧАТА")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "← ПОЛЬЗОВАТЕЛИ" })).toHaveAttribute("href", "/admin");
    expect(screen.getByRole("link", { name: "ИИ · МОДЕЛИ →" })).toHaveAttribute(
      "href",
      "/admin/ai-models",
    );
    expect(screen.getByRole("link", { name: "РЕДАКТОР →" })).toHaveAttribute("href", "/editor");
  });
});
