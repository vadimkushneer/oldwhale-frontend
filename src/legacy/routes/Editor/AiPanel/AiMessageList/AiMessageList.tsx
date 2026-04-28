import { useLayoutEffect, useRef, type MouseEvent, type Ref } from "react";
import { Whale } from "../../../../ui/Whale";
import { ChatMessage } from "./ChatMessage";
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
  onDeleteMessage: (id: string) => void;
}) {
  const { rows } = useAiMessageList({ messages, getProviderColor });
  const scrollRootRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const el = scrollRootRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [rows, loading, composerHeight]);

  return (
    <div ref={scrollRootRef} className="ai-message-list ow-app-scrollbar">
      <div className="ai-message-list__list" role="list">
        {rows.map((row) => (
          <ChatMessage
            key={row.id}
            id={row.id}
            type={row.type}
            selected={selectedMessageIds.has(row.id)}
            accentColor={row.accentColor}
            onToggleSelect={onToggleMessageSelect}
            onDelete={onDeleteMessage}
          >
            {row.text}
          </ChatMessage>
        ))}
      </div>
      {loading && (
        <div className="ai-message-list__loading">
          <Whale size={20} />
          <span className="ai-message-list__loading-label">ДУМАЕТ...</span>
        </div>
      )}
      <div ref={endRef} className="ai-message-list__end-anchor" />
    </div>
  );
}
