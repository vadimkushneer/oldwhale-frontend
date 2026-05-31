import { configureStore } from "@reduxjs/toolkit";
import { render, screen } from "@testing-library/react";
import { Provider } from "react-redux";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import type { User } from "../../api/types";
import { authSlice } from "../../features/auth/authSlice";
import { UsersAdmin } from "./UsersAdmin";

vi.mock("../../features/admin/adminApi", () => ({
  useListUsersQuery: vi.fn(() => ({
    data: [] as User[],
    isLoading: false,
    refetch: vi.fn(),
  })),
  useCreateUserMutation: vi.fn(() => [vi.fn(), { isLoading: false }]),
  usePatchUserMutation: vi.fn(() => [vi.fn(), { isLoading: false }]),
  useDeleteUserMutation: vi.fn(() => [vi.fn(), { isLoading: false }]),
}));

vi.mock("../../hooks/useOnlineStatus", () => ({
  useOnlineStatus: vi.fn(() => true),
}));

const adminUser: User = {
  id: 1,
  login: "admin",
  email: "admin@example.com",
  role: "admin",
  disabled: false,
  credits: 300,
  created_at: "",
};

const regularUser: User = {
  ...adminUser,
  id: 2,
  login: "user",
  email: "user@example.com",
  role: "user",
};

function renderUsersAdmin(initialAuth: {
  token: string | null;
  user: User | null;
  restoreStatus: "idle" | "restoring" | "ready";
}) {
  const store = configureStore({
    reducer: { auth: authSlice.reducer },
    preloadedState: {
      auth: {
        token: initialAuth.token,
        user: initialAuth.user,
        restoreStatus: initialAuth.restoreStatus,
        loginLoading: false,
        registerLoading: false,
        passwordResetLoading: false,
        lastError: null,
        sessionExpired: false,
      },
    },
  });
  return render(
    <Provider store={store}>
      <MemoryRouter>
        <UsersAdmin />
      </MemoryRouter>
    </Provider>,
  );
}

describe("UsersAdmin", () => {
  it("renders the toolbar title when an admin is ready", () => {
    renderUsersAdmin({ token: "t", user: adminUser, restoreStatus: "ready" });
    expect(screen.getByText("АДМИН · ПОЛЬЗОВАТЕЛИ")).toBeInTheDocument();
  });

  it("shows the session-restore screen while auth is being restored", () => {
    renderUsersAdmin({ token: "t", user: adminUser, restoreStatus: "restoring" });
    expect(screen.getByText("ВОССТАНОВЛЕНИЕ СЕССИИ…")).toBeInTheDocument();
  });

  it("shows the forbidden screen for non-admin users", () => {
    renderUsersAdmin({ token: "t", user: regularUser, restoreStatus: "ready" });
    expect(screen.getByText("НЕДОСТАТОЧНО ПРАВ")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "← К РЕДАКТОРУ" })).toHaveAttribute(
      "href",
      "/editor",
    );
  });
});
