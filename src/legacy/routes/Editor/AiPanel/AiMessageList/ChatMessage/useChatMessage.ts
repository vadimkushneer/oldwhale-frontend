import { useCallback, useMemo, type MouseEvent } from "react";
import type { ChatMessageType } from "../../../../../domain/aiMessageTypes";

export type UseChatMessageArgs = {
  id: string;
  type: ChatMessageType;
  selected: boolean;
  onToggleSelect: (id: string, event: MouseEvent) => void;
  onDelete: (id: string) => void;
};

export function useChatMessage({ id, type, selected, onToggleSelect, onDelete }: UseChatMessageArgs) {
  const rootClassName = useMemo(() => {
    const parts = [
      "chat-message",
      `chat-message--${type}`,
      selected ? "chat-message--selected" : "",
    ];
    return parts.filter(Boolean).join(" ");
  }, [type, selected]);

  const rowClassName = useMemo(() => {
    const align = type === "user" ? "chat-message__row--user" : "chat-message__row--assistant";
    return `chat-message__row ${align}`;
  }, [type]);

  const bubbleClassName = useMemo(() => {
    const mod =
      type === "user" ? "chat-message__bubble--user" : type === "ai" ? "chat-message__bubble--ai" : "chat-message__bubble--sys";
    return `chat-message__bubble ${mod}`;
  }, [type]);

  const onRowMouseDown = useCallback(
    (e: MouseEvent<HTMLDivElement>) => {
      if ((e.target as HTMLElement).closest("button")) return;
      onToggleSelect(id, e);
    },
    [id, onToggleSelect],
  );

  const onDeleteClick = useCallback(
    (e: MouseEvent<HTMLButtonElement>) => {
      e.stopPropagation();
      onDelete(id);
    },
    [id, onDelete],
  );

  return {
    rootClassName,
    rowClassName,
    bubbleClassName,
    onRowMouseDown,
    onDeleteClick,
  };
}
