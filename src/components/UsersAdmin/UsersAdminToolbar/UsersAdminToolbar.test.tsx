import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { UsersAdminToolbar } from "./UsersAdminToolbar";

function renderToolbar() {
  return render(
    <MemoryRouter>
      <UsersAdminToolbar />
    </MemoryRouter>,
  );
}

describe("UsersAdminToolbar", () => {
  it("renders the page title", () => {
    renderToolbar();
    expect(screen.getByText("АДМИН · ПОЛЬЗОВАТЕЛИ")).toBeInTheDocument();
  });

  it("renders the chat-logs nav link", () => {
    renderToolbar();
    expect(screen.getByRole("link", { name: "ЖУРНАЛ ИИ‑ЧАТА →" })).toHaveAttribute(
      "href",
      "/admin/ai-chat-logs",
    );
  });

  it("renders the AI models nav link", () => {
    renderToolbar();
    expect(screen.getByRole("link", { name: "ИИ · МОДЕЛИ →" })).toHaveAttribute(
      "href",
      "/admin/ai-models",
    );
  });

  it("renders the editor nav link", () => {
    renderToolbar();
    expect(screen.getByRole("link", { name: "РЕДАКТОР →" })).toHaveAttribute(
      "href",
      "/editor",
    );
  });
});
