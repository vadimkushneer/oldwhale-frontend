import type { CSSProperties } from "react";
import { SceneActCard } from "./SceneActCard";
import { SceneItemCard } from "./SceneItemCard";
import { useSceneList, type SceneItem, type SceneListProps } from "./useSceneList";
import "./SceneList.scss";

export type { SceneItem, SceneListProps, SceneCardMeta, DesktopSceneCardMeta } from "./useSceneList";

function actSceneSelection(
  scenes: readonly SceneItem[],
  actNum: number,
  selected: ReadonlySet<string>,
): { count: number; allSelected: boolean } {
  const actScenes = scenes.filter((ss) => ss.kind === "scene" && ss.actNum === actNum);
  const count = actScenes.length;
  const allSelected = count > 0 && actScenes.every((ss) => selected.has(ss.id));
  return { count, allSelected };
}

export function SceneList(props: SceneListProps) {
  const {
    scenes,
    mode,
    activeSceneId,
    selectedScenes,
    getDesktopSceneCardMeta,
    onToggleActSelect,
    onToggleSceneSelect,
    onDupScene,
    onDelScene,
  } = props;

  const {
    cssVars,
    dragSceneId,
    dragOverId,
    ghostCssVars,
    sceneCardRefs,
    getMouseDownHandler,
    getClickHandler,
    getCardShellCssVars,
    interactionAllowed,
    mobileActionsSceneId,
    clearMobileSceneActions,
    getSceneItemCardPointerHandlers,
  } = useSceneList(props);

  const draggedScene = dragSceneId ? scenes.find((x) => x.id === dragSceneId) : undefined;

  return (
    <div className="scene-list" style={cssVars}>
      {scenes.map((s) => {
        const dropVisible = Boolean(dragSceneId && dragOverId === s.id);
        const isActive = activeSceneId === s.id;
        const isDragging = dragSceneId === s.id;
        const isSelected = selectedScenes.has(s.id);

        const cardMods = [
          "scene-list__card",
          isActive ? "scene-list__card--active" : "",
          isDragging ? "scene-list__card--dragging" : "",
          isSelected ? "scene-list__card--selected" : "",
        ]
          .filter(Boolean)
          .join(" ");

        const rowMods = [
          "scene-list__item",
          s.kind !== "act" && mobileActionsSceneId === s.id ? "scene-list__item--scene-actions-open" : "",
        ]
          .filter(Boolean)
          .join(" ");

        const sceneRowPointerHandlers = s.kind !== "act" ? getSceneItemCardPointerHandlers(s.id) : null;

        return (
          <div
            key={s.id}
            className={rowMods}
            onPointerDown={sceneRowPointerHandlers?.onPointerDown}
            onPointerMove={sceneRowPointerHandlers?.onPointerMove}
            onPointerUp={sceneRowPointerHandlers?.onPointerUp}
            onPointerCancel={sceneRowPointerHandlers?.onPointerCancel}
          >
            <div
              className={`scene-list__drop-indicator ${dropVisible ? "scene-list__drop-indicator--visible" : ""}`}
            />
            <div
              ref={(el) => {
                sceneCardRefs.current[s.id] = el;
              }}
              className={cardMods}
              style={getCardShellCssVars(s) as CSSProperties}
              data-scene-id={s.id}
              onMouseDown={getMouseDownHandler(s)}
              onClick={getClickHandler(s)}
            >
              {s.kind === "act" ? (
                (() => {
                  const actNum = s.actNum ?? 0;
                  const { count, allSelected } = actSceneSelection(scenes, actNum, selectedScenes);
                  const numLabel = mode !== "film" && s.num != null ? `${s.num}.` : null;
                  return (
                    <SceneActCard
                      scene={s}
                      mode={mode}
                      isActive={isActive}
                      actTitle={s.text || "—"}
                      numLabel={numLabel}
                      actAllSelected={allSelected}
                      actSceneCount={count}
                      interactionAllowed={interactionAllowed}
                      onToggleActSelect={onToggleActSelect}
                    />
                  );
                })()
              ) : (
                <SceneItemCard
                  scene={s}
                  meta={getDesktopSceneCardMeta(s)}
                  isActive={isActive}
                  isSelected={isSelected}
                  interactionAllowed={interactionAllowed}
                  onToggleSceneSelect={onToggleSceneSelect}
                  onDup={(id) => {
                    clearMobileSceneActions();
                    onDupScene(id);
                  }}
                  onDel={(id) => {
                    clearMobileSceneActions();
                    onDelScene(id);
                  }}
                />
              )}
            </div>
          </div>
        );
      })}

      {draggedScene && ghostCssVars ? (
        <div className="scene-list__ghost" style={ghostCssVars as CSSProperties}>
          <div className="scene-list__ghost-inner">
            <span className="scene-list__ghost-num">{draggedScene.num}.</span>
            <span className="scene-list__ghost-title">{draggedScene.text || "—"}</span>
          </div>
        </div>
      ) : null}
    </div>
  );
}
