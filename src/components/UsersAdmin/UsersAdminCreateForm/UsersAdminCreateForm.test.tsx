import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { UsersAdminCreateForm } from "./UsersAdminCreateForm";

const { createUser, createState } = vi.hoisted(() => ({
  createUser: vi.fn(),
  createState: { isLoading: false },
}));

vi.mock("../../../features/admin/adminApi", () => ({
  useCreateUserMutation: () => [createUser, createState],
}));

function unwrappableResolved<T>(value: T) {
  return { unwrap: () => Promise.resolve(value) };
}

function unwrappableRejected(error: unknown) {
  return { unwrap: () => Promise.reject(error) };
}

beforeEach(() => {
  createUser.mockReset();
  createState.isLoading = false;
});

describe("UsersAdminCreateForm", () => {
  it("submits valid input via createUser and clears the form", async () => {
    createUser.mockReturnValue(unwrappableResolved({ id: 99 }));

    render(<UsersAdminCreateForm />);

    const loginInput = screen.getByLabelText("Логин нового пользователя");
    const emailInput = screen.getByLabelText("Email нового пользователя");
    const passwordInput = screen.getByLabelText("Пароль нового пользователя");
    const roleSelect = screen.getByLabelText("Роль нового пользователя");

    fireEvent.change(loginInput, { target: { value: "newuser" } });
    fireEvent.change(emailInput, { target: { value: "new@user.dev" } });
    fireEvent.change(passwordInput, { target: { value: "secret" } });
    fireEvent.change(roleSelect, { target: { value: "admin" } });

    fireEvent.click(screen.getByRole("button", { name: "СОЗДАТЬ" }));

    await waitFor(() => {
      expect(createUser).toHaveBeenCalledWith({
        login: "newuser",
        email: "new@user.dev",
        password: "secret",
        role: "admin",
      });
    });

    await waitFor(() => {
      expect(loginInput).toHaveValue("");
    });
    expect(emailInput).toHaveValue("");
    expect(passwordInput).toHaveValue("");
    expect(roleSelect).toHaveValue("user");
  });

  it("shows a validation error when the login is too short", () => {
    render(<UsersAdminCreateForm />);

    fireEvent.change(screen.getByLabelText("Логин нового пользователя"), {
      target: { value: "a" },
    });
    fireEvent.change(screen.getByLabelText("Пароль нового пользователя"), {
      target: { value: "longenough" },
    });

    fireEvent.click(screen.getByRole("button", { name: "СОЗДАТЬ" }));

    expect(screen.getByRole("alert")).toHaveTextContent(
      "Логин ≥2 символа, пароль ≥4 (админ).",
    );
    expect(createUser).not.toHaveBeenCalled();
  });

  it("shows a validation error when the password is too short", () => {
    render(<UsersAdminCreateForm />);

    fireEvent.change(screen.getByLabelText("Логин нового пользователя"), {
      target: { value: "validlogin" },
    });
    fireEvent.change(screen.getByLabelText("Пароль нового пользователя"), {
      target: { value: "no" },
    });

    fireEvent.click(screen.getByRole("button", { name: "СОЗДАТЬ" }));

    expect(screen.getByRole("alert")).toHaveTextContent(
      "Логин ≥2 символа, пароль ≥4 (админ).",
    );
    expect(createUser).not.toHaveBeenCalled();
  });

  it("surfaces server-side error messages", async () => {
    createUser.mockReturnValue(
      unwrappableRejected({ data: { error: "login already taken" } }),
    );

    render(<UsersAdminCreateForm />);

    fireEvent.change(screen.getByLabelText("Логин нового пользователя"), {
      target: { value: "exists" },
    });
    fireEvent.change(screen.getByLabelText("Пароль нового пользователя"), {
      target: { value: "qwerty" },
    });

    fireEvent.click(screen.getByRole("button", { name: "СОЗДАТЬ" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("login already taken");
  });

  it("disables the submit button while busy", () => {
    createState.isLoading = true;
    render(<UsersAdminCreateForm />);
    expect(screen.getByRole("button", { name: "…" })).toBeDisabled();
  });
});
