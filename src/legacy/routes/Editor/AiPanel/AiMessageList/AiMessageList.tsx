import type { CSSProperties, Ref } from "react";
import { BG, SH_SM, SURF, T1, T2, T3 } from "../../../../ui/tokens";
import { Whale } from "../../../../ui/Whale";
import { useAiMessageList, type AiMessageListMessage } from "./useAiMessageList";
import "./AiMessageList.scss";

const cssVarsBase = {
  "--aml-bg": BG,
  "--aml-surf": SURF,
  "--aml-sh-sm": SH_SM,
  "--aml-t1": T1,
  "--aml-t2": T2,
  "--aml-t3": T3,
} as CSSProperties;

export type { AiMessageListMessage };

export function AiMessageList({
  messages,
  loading,
  endRef,
  getProviderColor,
}: {
  messages: readonly AiMessageListMessage[];
  loading: boolean;
  endRef: Ref<HTMLDivElement>;
  getProviderColor: (modelId?: string) => string;
}) {
  const { rows } = useAiMessageList({ messages, getProviderColor });

  return (
    <div className="ai-message-list ow-app-scrollbar" style={cssVarsBase}>
      {rows.map((row) => (
        <div
          key={row.key}
          className={`ai-message-list__row ai-message-list__row--${row.align}`}
          style={
            row.bubbleModifier === "ai"
              ? ({ "--aml-border": row.borderLeftColor ?? "transparent" } as CSSProperties)
              : undefined
          }
        >
          <div className={`ai-message-list__bubble ai-message-list__bubble--${row.bubbleModifier}`}>
            {row.text}
          </div>
        </div>
      ))}
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
