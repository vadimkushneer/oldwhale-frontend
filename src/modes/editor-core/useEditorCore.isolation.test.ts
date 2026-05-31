import { describe, expect, it } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useEditorCore } from "./useEditorCore";

function setup(mode: string, initial: any[]) {
  const modeRef = { current: mode } as any;
  const scheduleAutosaveRef = { current: () => {} } as any;
  return renderHook(() =>
    useEditorCore({
      mode,
      modeRef,
      setSaved: () => {},
      getInitialBlocks: () => initial.map((b) => ({ ...b })),
      scheduleAutosaveRef,
    }),
  );
}
const text = (r: any) => r.current.blocks.map((b: any) => b.text).join("|");

describe("useEditorCore — per-document isolation (undo / redo / mode)", () => {
  it("undo can't pull text from a previous document after a switch", () => {
    const { result } = setup("film", [{ id: "a", type: "action", text: "file ONE" }]);
    act(() => { result.current.applyBlocks([{ id: "a", type: "action", text: "file ONE edited" }]); });
    // loadProject pattern: reset history for the new doc, then set its blocks
    act(() => {
      result.current.resetModeHistories("film", [{ id: "b", type: "action", text: "file TWO" }]);
      result.current.setBlocks([{ id: "b", type: "action", text: "file TWO" }]);
    });
    act(() => { result.current.undo(); });
    expect(text(result)).not.toContain("file ONE");
    expect(text(result)).toContain("file TWO");
  });

  it("redo after a switch does not surface the previous document", () => {
    const { result } = setup("play", [{ id: "x", type: "line", text: "alpha" }]);
    act(() => { result.current.applyBlocks([{ id: "x", type: "line", text: "alpha-2" }]); });
    act(() => { result.current.undo(); });
    act(() => {
      result.current.resetModeHistories("play", [{ id: "y", type: "line", text: "beta" }]);
      result.current.setBlocks([{ id: "y", type: "line", text: "beta" }]);
    });
    act(() => { result.current.redo(); });
    expect(text(result)).not.toContain("alpha");
    expect(text(result)).toContain("beta");
  });

  it("history stays independent per mode (film undo never walks play)", () => {
    const { result } = setup("film", [{ id: "a", type: "action", text: "FILM" }]);
    act(() => { result.current.applyBlocks([{ id: "a", type: "action", text: "FILM edit" }]); });
    act(() => { result.current.ensureModeHistory("play", [{ id: "p", type: "line", text: "PLAY" }]); });
    act(() => { result.current.undo(); });
    expect(text(result)).toContain("FILM");
    expect(text(result)).not.toContain("PLAY");
  });
});
