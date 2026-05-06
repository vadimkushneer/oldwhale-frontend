import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { UsersAdminCreateFormField } from "./UsersAdminCreateFormField";

describe("UsersAdminCreateFormField", () => {
  it("renders the label text", () => {
    render(
      <UsersAdminCreateFormField label="ЛОГИН">
        <input data-testid="control" />
      </UsersAdminCreateFormField>,
    );
    expect(screen.getByText("ЛОГИН")).toBeInTheDocument();
  });

  it("forwards children inside the label so clicking focuses the control", () => {
    render(
      <UsersAdminCreateFormField label="ПАРОЛЬ">
        <input data-testid="control" />
      </UsersAdminCreateFormField>,
    );
    const control = screen.getByTestId("control");
    expect(control).toBeInTheDocument();
    expect(control.closest("label")).not.toBeNull();
  });
});
