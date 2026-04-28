import type { MouseEvent, Ref } from "react";
import { Whale } from "../../../../ui/Whale";
import { ChatMessage } from "./ChatMessage";
import { useAiMessageList, type AiMessageListMessage } from "./useAiMessageList";
import "./AiMessageList.scss";

export type { AiMessageListMessage };

export function AiMessageList({
  messages,
  loading,
  endRef,
  getProviderColor,
  selectedMessageIds,
  onToggleMessageSelect,
  onDeleteMessage,
}: {
  messages: readonly AiMessageListMessage[];
  loading: boolean;
  endRef: Ref<HTMLDivElement>;
  getProviderColor: (modelId?: string) => string;
  selectedMessageIds: ReadonlySet<string>;
  onToggleMessageSelect: (id: string, event: MouseEvent) => void;
  onDeleteMessage: (id: string) => void;
}) {
  const { rows } = useAiMessageList({ messages, getProviderColor });

  return (
    <div className="ai-message-list ow-app-scrollbar">
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
