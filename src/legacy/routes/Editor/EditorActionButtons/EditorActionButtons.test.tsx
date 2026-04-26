import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { EditorActionButtons } from "./EditorActionButtons";

describe("EditorActionButtons", () => {
  it("fires duplicate and delete callbacks in scene-card mode", () => {
    const onDuplicate = vi.fn();
    const onDelete = vi.fn();

    render(
      <EditorActionButtons
        variant="scene-card"
        duplicateLabel="Дублировать сцену"
        deleteLabel="Удалить сцену"
        onDuplicate={onDuplicate}
        onDelete={onDelete}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Дублировать сцену" }));
    fireEvent.click(screen.getByRole("button", { name: "Удалить сцену" }));

    expect(onDuplicate).toHaveBeenCalledTimes(1);
    expect(onDelete).toHaveBeenCalledTimes(1);
  });

  it("stops bubbling in scene-card mode", () => {
    const onMouseDown = vi.fn();
    const onClick = vi.fn();

    render(
      <div onMouseDown={onMouseDown} onClick={onClick}>
        <EditorActionButtons
          variant="scene-card"
          duplicateLabel="Дублировать сцену"
          deleteLabel="Удалить сцену"
          onDuplicate={vi.fn()}
          onDelete={vi.fn()}
        />
      </div>,
    );

    const duplicateButton = screen.getByRole("button", { name: "Дублировать сцену" });
    fireEvent.mouseDown(duplicateButton);
    fireEvent.click(duplicateButton);

    expect(onMouseDown).not.toHaveBeenCalled();
    expect(onClick).not.toHaveBeenCalled();
  });

  it("fires gutter actions on mouse down", () => {
    const onDuplicate = vi.fn();
    const onDelete = vi.fn();

    render(
      <EditorActionButtons
        variant="gutter"
        duplicateLabel="Дублировать блок"
        deleteLabel="Удалить блок"
        onDuplicate={onDuplicate}
        onDelete={onDelete}
      />,
    );

    fireEvent.mouseDown(screen.getByRole("button", { name: "Дублировать блок" }));
    fireEvent.mouseDown(screen.getByRole("button", { name: "Удалить блок" }));

    expect(onDuplicate).toHaveBeenCalledTimes(1);
    expect(onDelete).toHaveBeenCalledTimes(1);
  });

  it("keeps keyboard/click activation working for gutter buttons", () => {
    const onDuplicate = vi.fn();

    render(
      <EditorActionButtons
        variant="gutter"
        duplicateLabel="Дублировать блок"
        deleteLabel="Удалить блок"
        onDuplicate={onDuplicate}
        onDelete={vi.fn()}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Дублировать блок" }));

    expect(onDuplicate).toHaveBeenCalledTimes(1);
  });

  it("applies the expected BEM modifier classes per variant", () => {
    const { container, rerender } = render(
      <EditorActionButtons
        variant="scene-card"
        duplicateLabel="Дублировать сцену"
        deleteLabel="Удалить сцену"
        onDuplicate={vi.fn()}
        onDelete={vi.fn()}
      />,
    );

    expect(container.querySelector(".editor-action-buttons--scene-card")).toBeTruthy();
    expect(container.querySelector(".editor-action-buttons__button--duplicate")).toBeTruthy();
    expect(container.querySelector(".editor-action-buttons__button--delete")).toBeTruthy();

    rerender(
      <EditorActionButtons
        variant="gutter"
        duplicateLabel="Дублировать блок"
        deleteLabel="Удалить блок"
        onDuplicate={vi.fn()}
        onDelete={vi.fn()}
      />,
    );

    expect(container.querySelector(".editor-action-buttons--gutter")).toBeTruthy();
  });
});
