import type { CSSProperties } from "react";
import {
  useAiMessageContextMenu,
  type AiMessageContextMenuState,
} from "./useAiMessageContextMenu";
import "./AiMessageContextMenu.scss";

export type { AiMessageContextMenuState };

export function AiMessageContextMenu({
  menu,
  onSelectMessage,
  onSelectAllMessages,
  onDismiss,
}: {
  menu: AiMessageContextMenuState | null;
  onSelectMessage: (id: string) => void;
  onSelectAllMessages: () => void;
  onDismiss: () => void;
}) {
  if (!menu) return null;

  return (
    <AiMessageContextMenuCard
      menu={menu}
      onSelectMessage={onSelectMessage}
      onSelectAllMessages={onSelectAllMessages}
      onDismiss={onDismiss}
    />
  );
}

function AiMessageContextMenuCard({
  menu,
  onSelectMessage,
  onSelectAllMessages,
  onDismiss,
}: {
  menu: AiMessageContextMenuState;
  onSelectMessage: (id: string) => void;
  onSelectAllMessages: () => void;
  onDismiss: () => void;
}) {
  const { cssVars, itemLabel, onItemClick } = useAiMessageContextMenu({
    menu,
    onSelectMessage,
    onSelectAllMessages,
    onDismiss,
  });

  return (
    <div className="ai-message-context-menu">
      <div className="ai-message-context-menu__backdrop" onMouseDown={onDismiss} />
      <div
        className="ai-message-context-menu__card"
        style={cssVars as CSSProperties}
        onMouseDown={(event) => event.stopPropagation()}
        onClick={(event) => event.stopPropagation()}
      >
        <button type="button" className="ai-message-context-menu__item" onClick={onItemClick}>
          {itemLabel}
        </button>
      </div>
    </div>
  );
}
