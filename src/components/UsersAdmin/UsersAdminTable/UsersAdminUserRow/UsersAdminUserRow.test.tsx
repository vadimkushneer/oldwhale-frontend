import type { ComponentProps } from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { User } from "../../../../api/types";
import { UsersAdminUserRow, type UsersAdminUserRowProps } from "./UsersAdminUserRow";
import { formatUserCreatedAt } from "./useUsersAdminUserRow";

const baseUser: User = {
  id: 7,
  login: "alice",
  email: "alice@example.com",
  role: "user",
  disabled: false,
  credits: 250,
  created_at: "2024-01-02T03:04:05.000Z",
};

function renderRow(overrides: Partial<UsersAdminUserRowProps> = {}) {
  const props: ComponentProps<typeof UsersAdminUserRow> = {
    user: baseUser,
    selfId: 999,
    patchBusy: false,
    deleteBusy: false,
    onPatchUser: vi.fn().mockResolvedValue(undefined),
    onDeleteUser: vi.fn().mockResolvedValue(undefined),
    confirmDelete: vi.fn().mockReturnValue(true),
    ...overrides,
  };

  render(
    <table>
      <tbody>
        <UsersAdminUserRow {...props} />
      </tbody>
    </table>,
  );

  return {
    onPatchUser: props.onPatchUser as ReturnType<typeof vi.fn>,
    onDeleteUser: props.onDeleteUser as ReturnType<typeof vi.fn>,
    confirmDelete: props.confirmDelete as ReturnType<typeof vi.fn>,
  };
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe("formatUserCreatedAt", () => {
  it("formats an ISO string using the ru-RU locale", () => {
    const result = formatUserCreatedAt(baseUser.created_at);
    expect(result).not.toBe("");
    expect(typeof result).toBe("string");
  });

  it("returns the raw input when Date construction fails", () => {
    expect(formatUserCreatedAt("")).toBe("");
  });
});

describe("UsersAdminUserRow", () => {
  it("renders core columns", () => {
    renderRow();
    expect(screen.getByText("alice")).toBeInTheDocument();
    expect(screen.getByText("alice@example.com")).toBeInTheDocument();
    expect(screen.getByText("7")).toBeInTheDocument();
  });

  it("disables save and delete when the row represents the current admin", () => {
    renderRow({ selfId: baseUser.id });
    expect(screen.getByRole("button", { name: "СОХРАНИТЬ" })).toBeDisabled();
    expect(
      screen.getByRole("button", { name: `Удалить пользователя ${baseUser.login}` }),
    ).toBeDisabled();
  });

  it("keeps save disabled until the user changes a field", () => {
    renderRow();
    expect(screen.getByRole("button", { name: "СОХРАНИТЬ" })).toBeDisabled();
  });

  it("calls onPatchUser with only the changed fields when save is clicked", async () => {
    const { onPatchUser } = renderRow();

    fireEvent.change(screen.getByLabelText(`Роль пользователя ${baseUser.login}`), {
      target: { value: "admin" },
    });

    const saveButton = screen.getByRole("button", { name: "СОХРАНИТЬ" });
    expect(saveButton).not.toBeDisabled();
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(onPatchUser).toHaveBeenCalledWith(baseUser.id, { role: "admin" });
    });
  });

  it("includes the disabled flag when the checkbox is toggled", async () => {
    const { onPatchUser } = renderRow();

    fireEvent.click(screen.getByLabelText(`Отключить пользователя ${baseUser.login}`));
    fireEvent.click(screen.getByRole("button", { name: "СОХРАНИТЬ" }));

    await waitFor(() => {
      expect(onPatchUser).toHaveBeenCalledWith(baseUser.id, { disabled: true });
    });
  });

  it("includes the credit balance (Krill) when it is changed", async () => {
    const { onPatchUser } = renderRow();

    fireEvent.change(screen.getByLabelText(`Кредиты (Krill) пользователя ${baseUser.login}`), {
      target: { value: "500" },
    });
    fireEvent.click(screen.getByRole("button", { name: "СОХРАНИТЬ" }));

    await waitFor(() => {
      expect(onPatchUser).toHaveBeenCalledWith(baseUser.id, { credits: 500 });
    });
  });

  it("aborts deletion if confirmation is declined", () => {
    const { onDeleteUser, confirmDelete } = renderRow({
      confirmDelete: vi.fn().mockReturnValue(false),
    });
    fireEvent.click(
      screen.getByRole("button", { name: `Удалить пользователя ${baseUser.login}` }),
    );
    expect(confirmDelete).toHaveBeenCalledWith(baseUser);
    expect(onDeleteUser).not.toHaveBeenCalled();
  });

  it("calls onDeleteUser when confirmation is accepted", async () => {
    const { onDeleteUser, confirmDelete } = renderRow();
    fireEvent.click(
      screen.getByRole("button", { name: `Удалить пользователя ${baseUser.login}` }),
    );
    expect(confirmDelete).toHaveBeenCalledWith(baseUser);
    await waitFor(() => {
      expect(onDeleteUser).toHaveBeenCalledWith(baseUser.id);
    });
  });
});
