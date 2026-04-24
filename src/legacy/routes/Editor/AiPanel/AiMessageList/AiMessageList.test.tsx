import { createRef } from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { AiMessageList } from "./AiMessageList";

describe("AiMessageList", () => {
  const endRef = createRef<HTMLDivElement>();

  it("renders user messages with user row modifier", () => {
    render(
      <AiMessageList
        messages={[{ role: "user", text: "Hello" }]}
        loading={false}
        endRef={endRef}
        getProviderColor={() => "#fff"}
      />,
    );
    expect(screen.getByText("Hello")).toBeInTheDocument();
    const row = screen.getByText("Hello").closest(".ai-message-list__row");
    expect(row?.className).toContain("ai-message-list__row--user");
  });

  it("renders ai messages with ai bubble modifier", () => {
    render(
      <AiMessageList
        messages={[{ role: "ai", text: "Reply", model: "claude" }]}
        loading={false}
        endRef={endRef}
        getProviderColor={() => "#7c6af7"}
      />,
    );
    const bubble = screen.getByText("Reply");
    expect(bubble.className).toContain("ai-message-list__bubble--ai");
  });

  it("shows loading row when loading", () => {
    render(
      <AiMessageList messages={[]} loading endRef={endRef} getProviderColor={vi.fn()} />,
    );
    expect(screen.getByText("ДУМАЕТ...")).toBeInTheDocument();
  });

  it("does not show loading when not loading", () => {
    render(
      <AiMessageList messages={[{ role: "user", text: "x" }]} loading={false} endRef={endRef} getProviderColor={vi.fn()} />,
    );
    expect(screen.queryByText("ДУМАЕТ...")).not.toBeInTheDocument();
  });

  it("assigns endRef", () => {
    render(
      <AiMessageList messages={[]} loading={false} endRef={endRef} getProviderColor={vi.fn()} />,
    );
    expect(endRef.current?.className).toContain("ai-message-list__end-anchor");
  });
});
