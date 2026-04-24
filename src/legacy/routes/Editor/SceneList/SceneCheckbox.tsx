import type { MouseEvent } from "react";

type SceneCheckboxProps = {
  variant: "scene" | "act";
  /** Scene: selected. Act: all scenes in act selected. */
  filled: boolean;
  /** Act rows only: there is at least one scene in the act */
  actHasScenes: boolean;
  onClick: (e: MouseEvent<HTMLDivElement>) => void;
};

export function SceneCheckbox({ variant, filled, actHasScenes, onClick }: SceneCheckboxProps) {
  const showCheck =
    variant === "scene" ? filled : filled && actHasScenes;
  const mods = [
    "scene-checkbox",
    variant === "scene" && filled ? "scene-checkbox--scene-selected" : "",
    variant === "act" && filled && actHasScenes ? "scene-checkbox--act-complete" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={mods} onClick={onClick} role="presentation">
      {showCheck ? (
        <span className="scene-checkbox__mark" aria-hidden>
          ✓
        </span>
      ) : null}
    </div>
  );
}
