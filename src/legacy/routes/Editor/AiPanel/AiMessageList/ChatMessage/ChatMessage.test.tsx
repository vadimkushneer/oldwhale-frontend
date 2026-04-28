import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { ChatMessage } from "./ChatMessage";

describe("ChatMessage", () => {
  it("renders user type and body", () => {
    render(
      <ChatMessage id="m1" type="user" selected={false} onToggleSelect={vi.fn()} onDelete={vi.fn()}>
        Hello
      </ChatMessage>,
    );
    expect(screen.getByText("Hello")).toBeInTheDocument();
    expect(screen.getByRole("article")).toHaveAttribute("data-chat-message-type", "user");
  });

  it("calls onToggleSelect on row click", async () => {
    const user = userEvent.setup();
    const onToggleSelect = vi.fn();
    render(
      <ChatMessage id="m2" type="sys" selected={false} onToggleSelect={onToggleSelect} onDelete={vi.fn()}>
        Greeting
      </ChatMessage>,
    );
    await user.click(screen.getByRole("listitem"));
    expect(onToggleSelect).toHaveBeenCalledWith("m2", expect.any(Object));
  });

  it("does not toggle when clicking delete", async () => {
    const user = userEvent.setup();
    const onToggleSelect = vi.fn();
    const onDelete = vi.fn();
    render(
      <ChatMessage id="m3" type="ai" selected accentColor="#ff00aa" onToggleSelect={onToggleSelect} onDelete={onDelete}>
        Reply
      </ChatMessage>,
    );
    await user.click(screen.getByRole("button", { name: /удалить/i }));
    expect(onDelete).toHaveBeenCalledWith("m3");
    expect(onToggleSelect).not.toHaveBeenCalled();
  });

  it("shows accent stripe for ai when accentColor set", () => {
    const { container } = render(
      <ChatMessage id="m4" type="ai" selected={false} accentColor="#abc" onToggleSelect={vi.fn()} onDelete={vi.fn()}>
        AI
      </ChatMessage>,
    );
    const rect = container.querySelector("rect");
    expect(rect).toHaveAttribute("fill", "#abc");
  });
});
