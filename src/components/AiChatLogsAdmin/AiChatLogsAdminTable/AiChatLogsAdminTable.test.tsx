import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { AiChatLogItem } from "../../../api/types";
import { defaultColumnVisibility } from "../aiChatLogsAdminQuery";
import { AiChatLogsAdminTable } from "./AiChatLogsAdminTable";

const sampleRow: AiChatLogItem = {
  id: 1,
  created_at: "2026-01-01T00:00:00Z",
  user_id: 2,
  message: "hello world",
  group_slug: "g",
  variant_slug: "v",
  reply: "reply text",
  user_message_id: "um",
  assistant_message_id: "am",
  client_ip: "127.0.0.1",
  user_agent: "Mozilla",
  user: { id: 2, login: "u", email: "e@x.com" },
  editor_mode: "note",
  note_context: null,
};

describe("AiChatLogsAdminTable", () => {
  it("shows loading state", () => {
    render(
      <AiChatLogsAdminTable
        rows={[]}
        columnVisibility={defaultColumnVisibility()}
        isLoading
      />,
    );
    expect(screen.getByText("ЗАГРУЗКА…")).toBeInTheDocument();
  });

  it("renders row data when not loading", () => {
    render(
      <AiChatLogsAdminTable
        rows={[sampleRow]}
        columnVisibility={defaultColumnVisibility()}
        isLoading={false}
      />,
    );
    expect(screen.getByText("1")).toBeInTheDocument();
    expect(screen.getByText("hello world")).toBeInTheDocument();
  });
});
