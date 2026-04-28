import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { AiChatLogsAdminOfflineBanner } from "./AiChatLogsAdminOfflineBanner";

describe("AiChatLogsAdminOfflineBanner", () => {
  it("renders offline warning", () => {
    render(<AiChatLogsAdminOfflineBanner />);
    expect(
      screen.getByText("НЕТ ПОДКЛЮЧЕНИЯ — ДАННЫЕ МОГУТ БЫТЬ НЕАКТУАЛЬНЫ"),
    ).toBeInTheDocument();
  });
});
