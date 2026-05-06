import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { UsersAdminOfflineBanner } from "./UsersAdminOfflineBanner";

describe("UsersAdminOfflineBanner", () => {
  it("renders the offline warning copy", () => {
    render(<UsersAdminOfflineBanner />);
    expect(
      screen.getByText("НЕТ ПОДКЛЮЧЕНИЯ — АДМИН-ОПЕРАЦИИ НЕДОСТУПНЫ"),
    ).toBeInTheDocument();
  });

  it("uses the alert role for assistive technologies", () => {
    render(<UsersAdminOfflineBanner />);
    expect(screen.getByRole("alert")).toBeInTheDocument();
  });
});
