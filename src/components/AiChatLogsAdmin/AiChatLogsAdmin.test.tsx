import { render, screen } from "@testing-library/react";
import { Provider } from "react-redux";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import { configureStore } from "@reduxjs/toolkit";
import type { User } from "../../api/types";
import { authSlice } from "../../features/auth/authSlice";
import { AiChatLogsAdmin } from "./AiChatLogsAdmin";

vi.mock("../../features/admin/adminApi", () => ({
  useLazyGetAdminUiSettingsQuery: vi.fn(() => {
    const trigger = vi.fn(() => ({
      unwrap: () => Promise.resolve({ aiChatLogTable: { columns: {} } }),
    }));
    return [trigger];
  }),
  usePutAdminUiSettingsMutation: vi.fn(() => [
    vi.fn(() => ({
      unwrap: () =>
        Promise.resolve({ aiChatLogTable: { columns: {}, updated_at: null as string | null } }),
    })),
  ]),
  useListAiChatLogsQuery: vi.fn(() => ({
    data: { items: [], total: 0 },
    isLoading: false,
    isFetching: false,
    error: undefined,
    refetch: vi.fn(),
  })),
}));

vi.mock("../../hooks/useOnlineStatus", () => ({
  useOnlineStatus: vi.fn(() => true),
}));

const adminUser: User = {
  id: 1,
  login: "admin",
  email: "a@b.com",
  role: "admin",
  disabled: false,
  credits: 300,
  created_at: "",
};

function renderAdmin(initialAuth: {
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
        lastError: null,
        sessionExpired: false,
      },
    },
  });
  return render(
    <Provider store={store}>
      <MemoryRouter>
        <AiChatLogsAdmin />
      </MemoryRouter>
    </Provider>,
  );
}

describe("AiChatLogsAdmin", () => {
  it("shows journal title when admin is ready", async () => {
    renderAdmin({
      token: "t",
      user: adminUser,
      restoreStatus: "ready",
    });
    expect(await screen.findByText("АДМИН · ЖУРНАЛ ИИ‑ЧАТА")).toBeInTheDocument();
  });

  it("shows session restore when restore pending", () => {
    renderAdmin({
      token: "t",
      user: adminUser,
      restoreStatus: "restoring",
    });
    expect(screen.getByText("ВОССТАНОВЛЕНИЕ СЕССИИ…")).toBeInTheDocument();
  });
});
