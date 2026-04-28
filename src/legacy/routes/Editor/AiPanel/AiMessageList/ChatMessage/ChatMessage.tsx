import type { ReactNode } from "react";
import type { ChatMessageType } from "../../../../../domain/aiMessageTypes";
import { useChatMessage, type UseChatMessageArgs } from "./useChatMessage";
import "./ChatMessage.scss";

export type ChatMessageProps = Omit<UseChatMessageArgs, "onToggleSelect" | "onDelete"> & {
  accentColor?: string;
  children: ReactNode;
  onToggleSelect: UseChatMessageArgs["onToggleSelect"];
  onDelete: UseChatMessageArgs["onDelete"];
};

export function ChatMessage({ id, type, selected, accentColor, children, onToggleSelect, onDelete }: ChatMessageProps) {
  const { rootClassName, rowClassName, bubbleClassName, onRowMouseDown, onDeleteClick } = useChatMessage({
    id,
    type,
    selected,
    onToggleSelect,
    onDelete,
  });

  return (
    <article className={rootClassName} data-chat-message-id={id} data-chat-message-type={type}>
      <div
        className={rowClassName}
        onMouseDown={onRowMouseDown}
        role="listitem"
        aria-selected={selected}
      >
        <div className="chat-message__inner">
          {type === "ai" && accentColor ? (
            <svg
              className="chat-message__accent-swatch"
              width={3}
              height={48}
              viewBox="0 0 2 48"
              preserveAspectRatio="none"
              aria-hidden
            >
              <rect x="0" y="0" width="2" height="48" fill={accentColor} rx={1} />
            </svg>
          ) : null}
          <div className={bubbleClassName}>
            <div className="chat-message__body">{children}</div>
            <div className="chat-message__toolbar">
              <button type="button" className="chat-message__delete" onClick={onDeleteClick} aria-label="Удалить сообщение">
                Удалить
              </button>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
