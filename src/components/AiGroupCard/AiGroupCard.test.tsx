import type { ComponentProps } from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { AiGroupCard } from "./AiGroupCard";
import { reorderIdsMove } from "./useAiGroupCard";

describe("reorderIdsMove", () => {
  it("moves an id from a higher index before a lower one", () => {
    expect(reorderIdsMove([1, 2, 3], 2, 1)).toEqual([1, 3, 2]);
  });

  it("moves an id from a lower index to a higher index", () => {
    expect(reorderIdsMove([1, 2, 3, 4], 1, 3)).toEqual([1, 3, 4, 2]);
  });

  it("is a no-op when from and to are equal", () => {
    expect(reorderIdsMove([1, 2, 3], 1, 1)).toEqual([1, 2, 3]);
  });

  it("returns a shallow copy when indices are out of range", () => {
    const input = [1, 2, 3];
    const out = reorderIdsMove(input, -1, 0);
    expect(out).toEqual(input);
    expect(out).not.toBe(input);
  });
});

describe("AiGroupCard", () => {
  function renderCard(overrides: Partial<ComponentProps<typeof AiGroupCard>> = {}) {
    const onDragGroupIdChange = vi.fn();
    const onSelectGroup = vi.fn();
    const onReorderGroupIds = vi.fn();
    render(
      <AiGroupCard
        groupId={42}
        isSelected={false}
        busy={false}
        orderedGroupIds={[10, 20, 42]}
        dragGroupId={null}
        onDragGroupIdChange={onDragGroupIdChange}
        onSelectGroup={onSelectGroup}
        onReorderGroupIds={onReorderGroupIds}
        {...overrides}
      >
        <span>inner</span>
      </AiGroupCard>,
    );
    return { onDragGroupIdChange, onSelectGroup, onReorderGroupIds };
  }

  it("calls onSelectGroup with groupId on click", () => {
    const { onSelectGroup } = renderCard();
    fireEvent.click(screen.getByText("inner"));
    expect(onSelectGroup).toHaveBeenCalledTimes(1);
    expect(onSelectGroup).toHaveBeenCalledWith(42);
  });

  it("calls onDragGroupIdChange with groupId on drag start", () => {
    const { onDragGroupIdChange } = renderCard();
    fireEvent.dragStart(screen.getByText("inner"));
    expect(onDragGroupIdChange).toHaveBeenCalledWith(42);
  });

  it("does not start drag when busy", () => {
    const { onDragGroupIdChange } = renderCard({ busy: true });
    const card = screen.getByText("inner").parentElement;
    expect(card).toHaveAttribute("draggable", "false");
    fireEvent.dragStart(screen.getByText("inner"));
    expect(onDragGroupIdChange).not.toHaveBeenCalled();
  });

  it("calls onReorderGroupIds and clears drag on drop when reorder applies", () => {
    const { onDragGroupIdChange, onReorderGroupIds } = renderCard({
      groupId: 20,
      orderedGroupIds: [10, 20, 42],
      dragGroupId: 42,
    });
    fireEvent.drop(screen.getByText("inner"));
    expect(onReorderGroupIds).toHaveBeenCalledWith([10, 42, 20]);
    expect(onDragGroupIdChange).toHaveBeenLastCalledWith(null);
  });

  it("does not reorder when drag id matches drop target", () => {
    const { onDragGroupIdChange, onReorderGroupIds } = renderCard({
      dragGroupId: 42,
    });
    fireEvent.drop(screen.getByText("inner"));
    expect(onReorderGroupIds).not.toHaveBeenCalled();
    expect(onDragGroupIdChange).not.toHaveBeenCalled();
  });

  it("applies selected modifier class when isSelected", () => {
    renderCard({ isSelected: true });
    const card = screen.getByText("inner").parentElement;
    expect(card).toHaveClass("ai-group-card--selected");
  });
});
