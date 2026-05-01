import { createRef } from "react";
import { describe, it, expect, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AiMessageList } from "./AiMessageList";

const noopSet = new Set<string>();

describe("AiMessageList", () => {
  const endRef = createRef<HTMLDivElement>();

  it("renders user messages", () => {
    render(
      <AiMessageList
        messages={[{ id: "u1", role: "user", text: "Hello" }]}
        loading={false}
        endRef={endRef}
        getProviderColor={() => "#fff"}
        selectedMessageIds={noopSet}
        onToggleMessageSelect={vi.fn()}
        onSelectMessage={vi.fn()}
        onSelectAllMessages={vi.fn()}
        onDeleteMessage={vi.fn()}
      />,
    );
    expect(screen.getByText("Hello")).toBeInTheDocument();
    expect(screen.getByRole("article")).toHaveAttribute("data-chat-message-type", "user");
  });

  it("renders ai messages with accent stripe", () => {
    render(
      <AiMessageList
        messages={[{ id: "a1", role: "ai", text: "Reply", model: "claude" }]}
        loading={false}
        endRef={endRef}
        getProviderColor={() => "#7c6af7"}
        selectedMessageIds={noopSet}
        onToggleMessageSelect={vi.fn()}
        onSelectMessage={vi.fn()}
        onSelectAllMessages={vi.fn()}
        onDeleteMessage={vi.fn()}
      />,
    );
    const rect = document.querySelector("rect");
    expect(rect).toHaveAttribute("fill", "#7c6af7");
  });

  it("shows loading row when loading", () => {
    render(
      <AiMessageList
        messages={[]}
        loading
        endRef={endRef}
        getProviderColor={vi.fn()}
        selectedMessageIds={noopSet}
        onToggleMessageSelect={vi.fn()}
        onSelectMessage={vi.fn()}
        onSelectAllMessages={vi.fn()}
        onDeleteMessage={vi.fn()}
      />,
    );
    expect(screen.getByText("ДУМАЕТ...")).toBeInTheDocument();
  });

  it("does not show loading when not loading", () => {
    render(
      <AiMessageList
        messages={[{ id: "x", role: "user", text: "x" }]}
        loading={false}
        endRef={endRef}
        getProviderColor={vi.fn()}
        selectedMessageIds={noopSet}
        onToggleMessageSelect={vi.fn()}
        onSelectMessage={vi.fn()}
        onSelectAllMessages={vi.fn()}
        onDeleteMessage={vi.fn()}
      />,
    );
    expect(screen.queryByText("ДУМАЕТ...")).not.toBeInTheDocument();
  });

  it("assigns endRef", () => {
    render(
      <AiMessageList
        messages={[]}
        loading={false}
        endRef={endRef}
        getProviderColor={vi.fn()}
        selectedMessageIds={noopSet}
        onToggleMessageSelect={vi.fn()}
        onSelectMessage={vi.fn()}
        onSelectAllMessages={vi.fn()}
        onDeleteMessage={vi.fn()}
      />,
    );
    expect(endRef.current?.className).toContain("ai-message-list__end-anchor");
  });

  it("opens select-all menu from free-space right click", async () => {
    const user = userEvent.setup();
    const onSelectAllMessages = vi.fn();
    const { container } = render(
      <AiMessageList
        messages={[{ id: "u1", role: "user", text: "Hello" }]}
        loading={false}
        endRef={endRef}
        getProviderColor={vi.fn()}
        selectedMessageIds={noopSet}
        onToggleMessageSelect={vi.fn()}
        onSelectMessage={vi.fn()}
        onSelectAllMessages={onSelectAllMessages}
        onDeleteMessage={vi.fn()}
      />,
    );

    fireEvent.contextMenu(container.querySelector(".ai-message-list") as HTMLElement);
    await user.click(screen.getByRole("button", { name: "Выбрать все сообщения" }));
    expect(onSelectAllMessages).toHaveBeenCalledTimes(1);
  });

  it("opens single-message menu from message right click", async () => {
    const user = userEvent.setup();
    const onSelectMessage = vi.fn();
    render(
      <AiMessageList
        messages={[{ id: "u1", role: "user", text: "Hello" }]}
        loading={false}
        endRef={endRef}
        getProviderColor={vi.fn()}
        selectedMessageIds={noopSet}
        onToggleMessageSelect={vi.fn()}
        onSelectMessage={onSelectMessage}
        onSelectAllMessages={vi.fn()}
        onDeleteMessage={vi.fn()}
      />,
    );

    fireEvent.contextMenu(screen.getByRole("article"));
    await user.click(screen.getByRole("button", { name: "Выбрать" }));
    expect(onSelectMessage).toHaveBeenCalledWith("u1");
  });
});
