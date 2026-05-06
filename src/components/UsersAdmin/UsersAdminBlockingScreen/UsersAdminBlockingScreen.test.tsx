import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { UsersAdminBlockingScreen } from "./UsersAdminBlockingScreen";

describe("UsersAdminBlockingScreen", () => {
  it("renders the session-restore copy", () => {
    render(<UsersAdminBlockingScreen variant="session-restore" />);
    expect(screen.getByText("ВОССТАНОВЛЕНИЕ СЕССИИ…")).toBeInTheDocument();
  });

  it("renders the forbidden title, description, and supplied children", () => {
    render(
      <UsersAdminBlockingScreen variant="forbidden">
        <a href="/editor">to editor</a>
      </UsersAdminBlockingScreen>,
    );
    expect(screen.getByText("НЕДОСТАТОЧНО ПРАВ")).toBeInTheDocument();
    expect(
      screen.getByText("Эта страница доступна только администраторам."),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "to editor" })).toHaveAttribute(
      "href",
      "/editor",
    );
  });
});
