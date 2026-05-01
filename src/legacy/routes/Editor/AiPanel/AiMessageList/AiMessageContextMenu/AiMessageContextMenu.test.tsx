import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AiMessageContextMenu } from "./AiMessageContextMenu";

describe("AiMessageContextMenu", () => {
  it("renders the select-all action for free-space menus", () => {
    render(
      <AiMessageContextMenu
        menu={{ kind: "all", x: 10, y: 20 }}
        onSelectMessage={vi.fn()}
        onSelectAllMessages={vi.fn()}
        onDismiss={vi.fn()}
      />,
    );

    expect(screen.getByRole("button", { name: "Выбрать все сообщения" })).toBeInTheDocument();
  });

  it("runs select-all and dismisses", async () => {
    const user = userEvent.setup();
    const onSelectAllMessages = vi.fn();
    const onDismiss = vi.fn();
    render(
      <AiMessageContextMenu
        menu={{ kind: "all", x: 10, y: 20 }}
        onSelectMessage={vi.fn()}
        onSelectAllMessages={onSelectAllMessages}
        onDismiss={onDismiss}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Выбрать все сообщения" }));
    expect(onSelectAllMessages).toHaveBeenCalledTimes(1);
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it("runs single-message selection and dismisses", async () => {
    const user = userEvent.setup();
    const onSelectMessage = vi.fn();
    const onDismiss = vi.fn();
    render(
      <AiMessageContextMenu
        menu={{ kind: "message", x: 10, y: 20, messageId: "m2" }}
        onSelectMessage={onSelectMessage}
        onSelectAllMessages={vi.fn()}
        onDismiss={onDismiss}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Выбрать" }));
    expect(onSelectMessage).toHaveBeenCalledWith("m2");
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it("renders nothing without a menu", () => {
    const { container } = render(
      <AiMessageContextMenu
        menu={null}
        onSelectMessage={vi.fn()}
        onSelectAllMessages={vi.fn()}
        onDismiss={vi.fn()}
      />,
    );

    expect(container.querySelector(".ai-message-context-menu")).toBeNull();
  });
});
