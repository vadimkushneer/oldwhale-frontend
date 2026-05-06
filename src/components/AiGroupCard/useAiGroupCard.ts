import type { DragEvent } from "react";
import { useCallback, useMemo } from "react";

function cx(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

/** Move the item at `from` to index `to` in a copy of `ids` (same semantics as splice-out-then-insert). */
export function reorderIdsMove<T>(ids: readonly T[], from: number, to: number): T[] {
  if (from < 0 || to < 0 || from >= ids.length || to >= ids.length) {
    return [...ids];
  }
  const next = [...ids];
  const [moved] = next.splice(from, 1);
  next.splice(to, 0, moved);
  return next;
}

export type UseAiGroupCardArgs = {
  groupId: string;
  isSelected: boolean;
  busy: boolean;
  orderedGroupIds: readonly string[];
  dragGroupId: string | null;
  onDragGroupIdChange: (id: string | null) => void;
  onSelectGroup: (id: string) => void;
  onReorderGroupIds: (ids: string[]) => void;
};

export function useAiGroupCard({
  groupId,
  isSelected,
  busy,
  orderedGroupIds,
  dragGroupId,
  onDragGroupIdChange,
  onSelectGroup,
  onReorderGroupIds,
}: UseAiGroupCardArgs) {
  const className = useMemo(
    () =>
      cx(
        "ai-group-card",
        isSelected ? "ai-group-card--selected" : "ai-group-card--idle",
      ),
    [isSelected],
  );

  const onDragStart = useCallback(() => {
    if (busy) return;
    onDragGroupIdChange(groupId);
  }, [busy, groupId, onDragGroupIdChange]);

  const onDragOver = useCallback((e: DragEvent) => {
    e.preventDefault();
  }, []);

  const onDrop = useCallback(() => {
    if (dragGroupId == null || dragGroupId === groupId) return;
    const ids = orderedGroupIds;
    const from = ids.indexOf(dragGroupId);
    const to = ids.indexOf(groupId);
    if (from < 0 || to < 0) return;
    const next = reorderIdsMove(ids, from, to);
    onReorderGroupIds(next);
    onDragGroupIdChange(null);
  }, [dragGroupId, groupId, orderedGroupIds, onDragGroupIdChange, onReorderGroupIds]);

  const onClick = useCallback(() => {
    onSelectGroup(groupId);
  }, [groupId, onSelectGroup]);

  return {
    className,
    draggable: !busy,
    onDragStart,
    onDragOver,
    onDrop,
    onClick,
  };
}
