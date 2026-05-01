import { useCallback, useMemo, type MouseEvent } from "react";
import type { ChatMessageType } from "../../../../../domain/aiMessageTypes";

export type UseChatMessageArgs = {
  id: string;
  type: ChatMessageType;
  selected: boolean;
  onToggleSelect: (id: string, event: MouseEvent) => void;
  onOpenContextMenu: (id: string, event: MouseEvent) => void;
  onDelete: (id: string) => void;
};

export function useChatMessage({ id, type, selected, onToggleSelect, onOpenContextMenu, onDelete }: UseChatMessageArgs) {
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
      if (e.button !== 0) return;
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

  const onContextMenu = useCallback(
    (e: MouseEvent<HTMLElement>) => {
      e.preventDefault();
      e.stopPropagation();
      onOpenContextMenu(id, e);
    },
    [id, onOpenContextMenu],
  );

  return {
    rootClassName,
    rowClassName,
    bubbleClassName,
    onRowMouseDown,
    onContextMenu,
    onDeleteClick,
  };
}
