import { fireEvent, render, screen } from "@testing-library/react";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { AiChatLogsAdminFilters } from "./AiChatLogsAdminFilters";

function Harness({
  onApply,
  onReset,
  onRefetch,
}: {
  onApply?: () => void;
  onReset?: () => void;
  onRefetch?: () => void;
}) {
  const [draft, setDraft] = useState<Record<string, string>>({});
  return (
    <AiChatLogsAdminFilters
      draft={draft}
      setDraft={setDraft}
      onApply={(e) => {
        e.preventDefault();
        onApply?.();
      }}
      onReset={() => {
        onReset?.();
        setDraft({});
      }}
      onRefetch={onRefetch ?? vi.fn()}
    />
  );
}

describe("AiChatLogsAdminFilters", () => {
  it("submits apply", () => {
    const onApply = vi.fn();
    render(<Harness onApply={onApply} />);
    fireEvent.click(screen.getByRole("button", { name: "ПРИМЕНИТЬ" }));
    expect(onApply).toHaveBeenCalled();
  });

  it("calls reset", () => {
    const onReset = vi.fn();
    render(<Harness onReset={onReset} />);
    fireEvent.click(screen.getByRole("button", { name: "СБРОС" }));
    expect(onReset).toHaveBeenCalled();
  });

  it("calls refetch", () => {
    const onRefetch = vi.fn();
    render(<Harness onRefetch={onRefetch} />);
    fireEvent.click(screen.getByRole("button", { name: "ОБНОВИТЬ" }));
    expect(onRefetch).toHaveBeenCalled();
  });
});
