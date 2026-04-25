import { createRef, type ComponentProps } from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { LeftSidebar } from "./LeftSidebar";

const sceneListMock = vi.hoisted(() => vi.fn());

vi.mock("../SceneList", () => ({
  SceneList: (props: { scenes: Array<{ id: string }>; accent: string; mode: string }) => {
    sceneListMock(props);
    return <div data-testid="scene-list">SceneList {props.scenes.length}</div>;
  },
}));

type LeftSidebarComponentProps = ComponentProps<typeof LeftSidebar>;

function makeProps(overrides: Partial<LeftSidebarComponentProps> = {}): LeftSidebarComponentProps {
  return {
    width: 215,
    mode: "film",
    accent: "#4ade80",
    stats: {
      timing: "95",
      pages: 12,
      words: 3456,
    },
    scenes: [
      { id: "act-1", kind: "act", num: 1, actNum: 1, text: "ACT I", index: 0 },
      { id: "scene-1", kind: "scene", num: 1, actNum: 1, subNum: 1, text: "Opening", index: 1 },
      { id: "scene-2", kind: "scene", num: 2, actNum: 1, subNum: 2, text: "Conflict", index: 2 },
    ],
    activeSceneId: "scene-1",
    selectedScenes: new Set<string>(),
    markerModeOn: false,
    editorSearchOpen: false,
    editorSearchQuery: "",
    editorSearchMatchesCount: 0,
    searchInputRef: createRef<HTMLInputElement>(),
    copyToast: false,
    credits: 340,
    getTooltipAnchorProps: (label: string) => ({ "data-tooltip": label }),
    getSceneCardMetaById: () => ({}),
    getDesktopSceneCardMeta: () => ({
      cardMeta: {},
      castText: "",
      previewText: "",
      previewLines: 0,
    }),
    onCollapse: vi.fn(),
    onToggleMenu: vi.fn(),
    onSwitchMode: vi.fn(),
    onOpenMyProjects: vi.fn(),
    onCreateProject: vi.fn(),
    onOpenSceneCards: vi.fn(),
    onToggleEditorSearch: vi.fn(),
    onCloseEditorSearch: vi.fn(),
    onEditorSearchQueryChange: vi.fn(),
    onToggleMarkerMode: vi.fn(),
    onCopySelectedScenes: vi.fn(),
    onDeleteScene: vi.fn(),
    onClearSelectedScenes: vi.fn(),
    onGoToScene: vi.fn(),
    onSetActiveSceneId: vi.fn(),
    onToggleSceneSelect: vi.fn(),
    onToggleActSelect: vi.fn(),
    onDupScene: vi.fn(),
    onMoveScene: vi.fn(),
    onAddSceneAfterLast: vi.fn(),
    onInsertFilmAct: vi.fn(),
    onInsertPlayAct: vi.fn(),
    onLogout: vi.fn(),
    ...overrides,
  };
}

afterEach(() => {
  sceneListMock.mockReset();
  vi.clearAllMocks();
});

describe("LeftSidebar", () => {
  it("renders the brand, stats, scene count, and passes data to SceneList", () => {
    render(<LeftSidebar {...makeProps()} />);

    expect(screen.getByText("OLD WHALE")).toBeInTheDocument();
    expect(screen.getByText("СЦЕНЫ — 2")).toBeInTheDocument();
    expect(screen.getByTestId("scene-list")).toHaveTextContent("SceneList 3");
    expect(sceneListMock).toHaveBeenCalled();
    expect(sceneListMock.mock.calls.at(-1)?.[0]).toMatchObject({
      accent: "#4ade80",
      mode: "film",
    });
  });

  it("routes header, mode, and quick-action clicks to the provided callbacks", () => {
    const props = makeProps();
    render(<LeftSidebar {...props} />);

    fireEvent.click(screen.getByTitle("Свернуть левое меню"));
    fireEvent.click(screen.getByTitle("Открыть меню проекта"));
    fireEvent.click(screen.getByTitle("Пьеса"));
    fireEvent.click(screen.getByLabelText("Мои проекты"));
    fireEvent.click(screen.getByLabelText("Новый проект"));
    fireEvent.click(screen.getByLabelText("Карточки сцен"));
    fireEvent.click(screen.getByLabelText("Поиск в активном редакторе"));
    fireEvent.click(screen.getByLabelText("Режим маркера"));

    expect(props.onCollapse).toHaveBeenCalledTimes(1);
    expect(props.onToggleMenu).toHaveBeenCalledTimes(1);
    expect(props.onSwitchMode).toHaveBeenCalledWith("play");
    expect(props.onOpenMyProjects).toHaveBeenCalledTimes(1);
    expect(props.onCreateProject).toHaveBeenCalledTimes(1);
    expect(props.onOpenSceneCards).toHaveBeenCalledTimes(1);
    expect(props.onToggleEditorSearch).toHaveBeenCalledTimes(1);
    expect(props.onToggleMarkerMode).toHaveBeenCalledTimes(1);
  });

  it("renders the search panel and closes it on Escape", () => {
    const props = makeProps({
      editorSearchOpen: true,
      editorSearchQuery: "hero",
      editorSearchMatchesCount: 3,
    });

    render(<LeftSidebar {...props} />);

    const input = screen.getByPlaceholderText("Поиск / #тег");
    expect(screen.getByText("НАЙДЕНО: 3")).toBeInTheDocument();
    fireEvent.change(input, { target: { value: "villain" } });
    fireEvent.keyDown(input, { key: "Escape" });
    fireEvent.click(screen.getByLabelText("Свернуть поиск"));

    expect(props.onEditorSearchQueryChange).toHaveBeenCalledWith("villain");
    expect(props.onCloseEditorSearch).toHaveBeenCalledTimes(2);
  });

  it("copies and deletes the current scene selection", () => {
    const props = makeProps({
      selectedScenes: new Set(["scene-1", "scene-2"]),
      copyToast: true,
    });

    render(<LeftSidebar {...props} />);

    fireEvent.click(screen.getByRole("button", { name: "✓ СКОПИРОВАНО" }));
    fireEvent.click(screen.getByLabelText("Удалить выбранные сцены"));

    expect(props.onCopySelectedScenes).toHaveBeenCalledTimes(1);
    expect(props.onDeleteScene).toHaveBeenNthCalledWith(1, "scene-1");
    expect(props.onDeleteScene).toHaveBeenNthCalledWith(2, "scene-2");
    expect(props.onClearSelectedScenes).toHaveBeenCalledTimes(1);
  });

  it("renders mode-specific add buttons", () => {
    const filmProps = makeProps();
    const { rerender } = render(<LeftSidebar {...filmProps} />);

    fireEvent.click(screen.getByText("СЦЕНА"));
    fireEvent.click(screen.getByText("АКТ"));
    expect(filmProps.onAddSceneAfterLast).toHaveBeenCalledTimes(1);
    expect(filmProps.onInsertFilmAct).toHaveBeenCalledTimes(1);

    const noteProps = makeProps({ mode: "note" });
    rerender(<LeftSidebar {...noteProps} />);
    expect(screen.getByText("+ НОВАЯ СЦЕНА")).toBeInTheDocument();
    expect(screen.queryByText("АКТ")).not.toBeInTheDocument();
  });

  it("falls back to a custom accent variable and marks low credits", () => {
    const { container } = render(
      <LeftSidebar
        {...makeProps({
          accent: "#123456",
          credits: 10,
        })}
      />,
    );

    const root = container.querySelector(".left-sidebar") as HTMLElement;
    const creditsValue = screen.getByText("10");
    const progress = container.querySelector(".left-sidebar__credits-meter") as HTMLElement;

    expect(root.className).toContain("left-sidebar--accent-custom");
    expect(root.style.getPropertyValue("--ls-accent")).toBe("#123456");
    expect(creditsValue.className).toContain("left-sidebar__credits-value--low");
    expect(progress.className).toContain("left-sidebar__credits-meter--low");
  });
});
