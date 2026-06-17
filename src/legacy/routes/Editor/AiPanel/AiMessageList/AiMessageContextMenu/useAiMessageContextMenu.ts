import { useCallback, useEffect, useMemo, type CSSProperties } from "react";
import i18n from "../../../../../../i18n";

export type AiMessageContextMenuState =
  | {
      kind: "all";
      x: number;
      y: number;
    }
  | {
      kind: "message";
      x: number;
      y: number;
      messageId: string;
    };

export function useAiMessageContextMenu({
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
  const cssVars = useMemo(() => {
    const left = Math.min(menu.x, (typeof window !== "undefined" ? window.innerWidth : 9999) - 190);
    const top = Math.min(menu.y, (typeof window !== "undefined" ? window.innerHeight : 9999) - 70);
    return {
      "--amcm-left": `${Math.max(8, left)}px`,
      "--amcm-top": `${Math.max(8, top)}px`,
    } as CSSProperties;
  }, [menu]);

  const itemLabel = useMemo(() => {
    const t = i18n.t.bind(i18n);
    return menu.kind === "message" ? t("ai.select") : t("ai.selectAll");
  }, [menu.kind, i18n.language]);

  const onItemClick = useCallback(() => {
    if (menu.kind === "message") onSelectMessage(menu.messageId);
    else onSelectAllMessages();
    onDismiss();
  }, [menu, onDismiss, onSelectAllMessages, onSelectMessage]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onDismiss();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onDismiss]);

  return {
    cssVars,
    itemLabel,
    onItemClick,
  };
}
