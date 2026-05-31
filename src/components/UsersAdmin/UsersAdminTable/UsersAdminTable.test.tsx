import type { ComponentProps } from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { User } from "../../../api/types";
import { UsersAdminTable } from "./UsersAdminTable";

const users: User[] = [
  {
    id: 1,
    login: "alpha",
    email: "alpha@example.com",
    role: "admin",
    disabled: false,
    credits: 300,
    created_at: "2024-01-02T00:00:00.000Z",
  },
  {
    id: 2,
    login: "bravo",
    email: "bravo@example.com",
    role: "user",
    disabled: true,
    credits: 0,
    created_at: "2024-02-03T00:00:00.000Z",
  },
];

function renderTable(overrides: Partial<ComponentProps<typeof UsersAdminTable>> = {}) {
  render(
    <UsersAdminTable
      users={users}
      isLoading={false}
      selfId={999}
      patchBusy={false}
      onPatchUser={vi.fn().mockResolvedValue(undefined)}
      deleteBusy={false}
      onDeleteUser={vi.fn().mockResolvedValue(undefined)}
      {...overrides}
    />,
  );
}

describe("UsersAdminTable", () => {
  it("renders the loading copy while users are being fetched", () => {
    renderTable({ isLoading: true });
    expect(screen.getByText("ЗАГРУЗКА…")).toBeInTheDocument();
    expect(screen.queryByRole("table")).not.toBeInTheDocument();
  });

  it("renders all column headers when ready", () => {
    renderTable();
    expect(screen.getByRole("table")).toBeInTheDocument();
    for (const label of ["ID", "ЛОГИН", "EMAIL", "РОЛЬ", "ОТКЛ.", "СОЗДАН"]) {
      expect(screen.getByRole("columnheader", { name: label })).toBeInTheDocument();
    }
  });

  it("renders one row per supplied user", () => {
    renderTable();
    expect(screen.getByText("alpha")).toBeInTheDocument();
    expect(screen.getByText("bravo")).toBeInTheDocument();
    expect(screen.getByText("alpha@example.com")).toBeInTheDocument();
    expect(screen.getByText("bravo@example.com")).toBeInTheDocument();
  });

  it("renders an empty table body when there are no users", () => {
    renderTable({ users: [] });
    const table = screen.getByRole("table");
    expect(table).toBeInTheDocument();
    expect(table.querySelectorAll("tbody tr")).toHaveLength(0);
  });
});
