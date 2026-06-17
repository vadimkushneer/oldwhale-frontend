import { useCallback, useLayoutEffect, useRef, useState, type MouseEvent, type Ref } from "react";
import { useTranslation } from "react-i18next";
import { Whale } from "../../../../ui/Whale";
import { ChatMessage } from "./ChatMessage";
import {
  AiMessageContextMenu,
  type AiMessageContextMenuState,
} from "./AiMessageContextMenu/AiMessageContextMenu";
import { useAiMessageList, type AiMessageListMessage } from "./useAiMessageList";
import "./AiMessageList.scss";

export type { AiMessageListMessage };

export function AiMessageList({
  messages,
  loading,
  endRef,
  composerHeight,
  getProviderColor,
  selectedMessageIds,
  onToggleMessageSelect,
  onSelectMessage,
  onSelectAllMessages,
  onDeleteMessage,
}: {
  messages: readonly AiMessageListMessage[];
  loading: boolean;
  endRef: Ref<HTMLDivElement>;
  /** When set (e.g. desktop panel), list scrolls to bottom whenever the composer is resized. */
  composerHeight?: number;
  getProviderColor: (modelId?: string) => string;
  selectedMessageIds: ReadonlySet<string>;
  onToggleMessageSelect: (id: string, event: MouseEvent) => void;
  onSelectMessage: (id: string) => void;
  onSelectAllMessages: () => void;
  onDeleteMessage: (id: string) => void;
}) {
  const { t } = useTranslation();
  const { rows } = useAiMessageList({ messages, getProviderColor });
  const scrollRootRef = useRef<HTMLDivElement>(null);
  const [contextMenu, setContextMenu] = useState<AiMessageContextMenuState | null>(null);

  useLayoutEffect(() => {
    const el = scrollRootRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [rows, loading, composerHeight]);

  const closeContextMenu = useCallback(() => setContextMenu(null), []);

  const openFreeSpaceContextMenu = useCallback((event: MouseEvent<HTMLDivElement>) => {
    if ((event.target as HTMLElement).closest("[data-chat-message-id]")) return;
    event.preventDefault();
    setContextMenu({ kind: "all", x: event.clientX, y: event.clientY });
  }, []);

  const openMessageContextMenu = useCallback((id: string, event: MouseEvent) => {
    setContextMenu({ kind: "message", messageId: id, x: event.clientX, y: event.clientY });
  }, []);

  return (
    <div
      ref={scrollRootRef}
      className="ai-message-list ow-app-scrollbar"
      onContextMenu={openFreeSpaceContextMenu}
      onScroll={closeContextMenu}
    >
      <div className="ai-message-list__list" role="list">
        {rows.map((row) => (
          <ChatMessage
            key={row.id}
            id={row.id}
            type={row.type}
            selected={selectedMessageIds.has(row.id)}
            accentColor={row.accentColor}
            onToggleSelect={onToggleMessageSelect}
            onOpenContextMenu={openMessageContextMenu}
            onDelete={onDeleteMessage}
          >
            {row.text}
          </ChatMessage>
        ))}
      </div>
      {loading && (
        <div className="ai-message-list__loading">
          <Whale size={20} />
          <span className="ai-message-list__loading-label">{t("ai.thinking")}</span>
        </div>
      )}
      <div ref={endRef} className="ai-message-list__end-anchor" />
      <AiMessageContextMenu
        menu={contextMenu}
        onSelectMessage={onSelectMessage}
        onSelectAllMessages={onSelectAllMessages}
        onDismiss={closeContextMenu}
      />
    </div>
  );
}
