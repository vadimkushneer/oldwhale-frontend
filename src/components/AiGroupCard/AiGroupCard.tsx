import type { ReactNode } from "react";
import { useAiGroupCard, type UseAiGroupCardArgs } from "./useAiGroupCard";
import "./AiGroupCard.scss";

export type AiGroupCardProps = UseAiGroupCardArgs & {
  children: ReactNode;
};

export function AiGroupCard({ children, ...hookArgs }: AiGroupCardProps) {
  const { className, draggable, onDragStart, onDragOver, onDrop, onClick } =
    useAiGroupCard(hookArgs);

  return (
    <div
      className={className}
      draggable={draggable}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDrop={onDrop}
      onClick={onClick}
    >
      {children}
    </div>
  );
}
