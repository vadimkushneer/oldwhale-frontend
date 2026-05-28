import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import { EditorSideMenu } from "./EditorSideMenu";
import type { EditorSideMenuProps } from "./useEditorSideMenu";

function makeBaseProps(overrides: Partial<EditorSideMenuProps> = {}): EditorSideMenuProps {
  return {
    variant: "mobile",
    accent: "#7c6af7",
    mode: "film",
    isGuest: false,
    onClose: vi.fn(),
    onNewProject: vi.fn(),
    onSave: vi.fn(),
    onSaveAs: vi.fn(),
    onOpenHistory: vi.fn(),
    onOpenMyProjects: vi.fn(),
    onExportPdf: vi.fn(),
    onExportDocx: vi.fn(),
    onExportFdx: vi.fn(),
    onExportTxt: vi.fn(),
    onOpenImportPicker: vi.fn(),
    onImportFileChange: vi.fn(),
    onSwitchMode: vi.fn(),
    onShare: vi.fn(),
    onGoHome: vi.fn(),
    onLogout: vi.fn(),
    ...overrides,
  };
}

describe("EditorSideMenu", () => {
  it("renders shared sections and applies accent modifier", () => {
    const { container } = render(<EditorSideMenu {...makeBaseProps({ accent: "#4ade80" })} />);

    expect(screen.getByText("ПРОЕКТ")).toBeInTheDocument();
    expect(screen.getByText("ФАЙЛЫ")).toBeInTheDocument();
    expect(screen.getByText("РЕЖИМ")).toBeInTheDocument();
    expect(screen.getByText("ПРОЧЕЕ")).toBeInTheDocument();
    expect(container.querySelector(".editor-side-menu--accent-green")).toBeTruthy();
  });

  it("closes when overlay is clicked", () => {
    const onClose = vi.fn();
    render(<EditorSideMenu {...makeBaseProps({ onClose })} />);

    fireEvent.click(screen.getByRole("button", { name: "Закрыть меню" }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("mobile: shows Мои проекты and Поделиться; История does not call onClose", () => {
    const onClose = vi.fn();
    const onOpenHistory = vi.fn();
    render(
      <EditorSideMenu
        {...makeBaseProps({
          variant: "mobile",
          onClose,
          onOpenHistory,
        })}
      />,
    );

    expect(screen.getByText("Мои проекты")).toBeInTheDocument();
    expect(screen.getByText("Поделиться")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Закрыть панель" })).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "История" }));
    expect(onOpenHistory).toHaveBeenCalledTimes(1);
    expect(onClose).not.toHaveBeenCalled();
  });

  it("mobile: only overlay is named Закрыть меню", () => {
    render(<EditorSideMenu {...makeBaseProps({ variant: "mobile" })} />);
    expect(screen.getAllByRole("button", { name: "Закрыть меню" })).toHaveLength(1);
  });

  it("desktop: header close button and no Мои проекты / Поделиться", () => {
    const { container } = render(<EditorSideMenu {...makeBaseProps({ variant: "desktop", onShare: undefined })} />);

    expect(screen.queryByText("Мои проекты")).not.toBeInTheDocument();
    expect(screen.queryByText("Поделиться")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Закрыть панель" })).toBeInTheDocument();
    expect(container.querySelector(".editor-side-menu--desktop")).toBeTruthy();
  });

  it("mobile: guest sees ВОЙТИ on locked mode rows", () => {
    render(<EditorSideMenu {...makeBaseProps({ isGuest: true, variant: "mobile" })} />);
    expect(screen.getAllByText("ВОЙТИ").length).toBeGreaterThan(0);
  });

  it("desktop: guest does not see ВОЙТИ label", () => {
    render(<EditorSideMenu {...makeBaseProps({ isGuest: true, variant: "desktop", onShare: undefined })} />);
    expect(screen.queryByText("ВОЙТИ")).not.toBeInTheDocument();
  });

  it("hides DOCX export in note mode", () => {
    render(<EditorSideMenu {...makeBaseProps({ mode: "note" })} />);
    expect(screen.queryByText("Экспорт DOCX")).not.toBeInTheDocument();
  });

  it("calls onOpenImportPicker when Открыть is clicked", () => {
    const onOpenImportPicker = vi.fn();
    render(
      <EditorSideMenu
        {...makeBaseProps({
          variant: "desktop",
          onOpenImportPicker,
          onShare: undefined,
        })}
      />,
    );

    fireEvent.click(screen.getByText("Открыть"));
    expect(onOpenImportPicker).toHaveBeenCalledTimes(1);
  });

  it("calls onLogout when Выйти is clicked", () => {
    const onLogout = vi.fn();
    render(<EditorSideMenu {...makeBaseProps({ onLogout })} />);

    fireEvent.click(screen.getByRole("button", { name: "Выйти" }));
    expect(onLogout).toHaveBeenCalledTimes(1);
  });

  it("uses whale-import on mobile and whale-import-desk on desktop", () => {
    const { rerender, container } = render(<EditorSideMenu {...makeBaseProps({ variant: "mobile" })} />);
    expect(container.querySelector("#whale-import")).toBeTruthy();

    rerender(<EditorSideMenu {...makeBaseProps({ variant: "desktop", onShare: undefined })} />);
    expect(container.querySelector("#whale-import-desk")).toBeTruthy();
  });

  it("calls onSwitchMode with play when Пьеса row is clicked", () => {
    const onSwitchMode = vi.fn();
    render(<EditorSideMenu {...makeBaseProps({ onSwitchMode })} />);

    fireEvent.click(screen.getByRole("button", { name: /Пьеса/i }));
    expect(onSwitchMode).toHaveBeenCalledWith("play");
  });

  it("shows admin link when showAdminLink is true", () => {
    render(
      <MemoryRouter>
        <EditorSideMenu {...makeBaseProps({ showAdminLink: true, onShare: undefined, variant: "desktop" })} />
      </MemoryRouter>,
    );

    const link = screen.getByRole("link", { name: "АДМИН" });
    expect(link).toHaveAttribute("href", "/admin");
  });

  it("does not show admin link when showAdminLink is omitted", () => {
    render(<EditorSideMenu {...makeBaseProps()} />);
    expect(screen.queryByRole("link", { name: "АДМИН" })).not.toBeInTheDocument();
  });
});
