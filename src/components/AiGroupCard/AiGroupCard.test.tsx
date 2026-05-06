import type { ComponentProps } from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { AiGroupCard } from "./AiGroupCard";
import { reorderIdsMove } from "./useAiGroupCard";

const G10 = "10101010-1010-4010-8010-101010101010";
const G20 = "20202020-2020-4020-8020-202020202020";
const G42 = "42424242-4242-4242-8242-424242424242";

describe("reorderIdsMove", () => {
  it("moves an id from a higher index before a lower one", () => {
    expect(reorderIdsMove([G10, G20, G42], 2, 1)).toEqual([G10, G42, G20]);
  });

  it("moves an id from a lower index to a higher index", () => {
    expect(reorderIdsMove([G10, G20, G42, "44444444-4444-4444-8444-444444444444"], 1, 3)).toEqual([
      G10,
      G42,
      "44444444-4444-4444-8444-444444444444",
      G20,
    ]);
  });

  it("is a no-op when from and to are equal", () => {
    expect(reorderIdsMove([G10, G20, G42], 1, 1)).toEqual([G10, G20, G42]);
  });

  it("returns a shallow copy when indices are out of range", () => {
    const input = [G10, G20, G42];
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
        groupId={G42}
        isSelected={false}
        busy={false}
        orderedGroupIds={[G10, G20, G42]}
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
    expect(onSelectGroup).toHaveBeenCalledWith(G42);
  });

  it("calls onDragGroupIdChange with groupId on drag start", () => {
    const { onDragGroupIdChange } = renderCard();
    fireEvent.dragStart(screen.getByText("inner"));
    expect(onDragGroupIdChange).toHaveBeenCalledWith(G42);
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
      groupId: G20,
      orderedGroupIds: [G10, G20, G42],
      dragGroupId: G42,
    });
    fireEvent.drop(screen.getByText("inner"));
    expect(onReorderGroupIds).toHaveBeenCalledWith([G10, G42, G20]);
    expect(onDragGroupIdChange).toHaveBeenLastCalledWith(null);
  });

  it("does not reorder when drag id matches drop target", () => {
    const { onDragGroupIdChange, onReorderGroupIds } = renderCard({
      dragGroupId: G42,
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
