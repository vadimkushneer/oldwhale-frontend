import { fireEvent, render, screen } from "@testing-library/react";
import { useState } from "react";
import { describe, expect, it } from "vitest";
import { AiChatLogsAdminPagination } from "./AiChatLogsAdminPagination";

function Harness({
  total,
  totalPages,
  initialPage,
}: {
  total: number;
  totalPages: number;
  initialPage?: number;
}) {
  const [page, setPage] = useState(initialPage ?? 0);
  return (
    <AiChatLogsAdminPagination page={page} setPage={setPage} total={total} totalPages={totalPages} />
  );
}

describe("AiChatLogsAdminPagination", () => {
  it("renders nothing when total within limit", () => {
    const { container } = render(<Harness total={30} totalPages={1} />);
    expect(container.firstChild).toBeNull();
  });

  it("changes page", () => {
    render(<Harness total={120} totalPages={3} initialPage={0} />);
    fireEvent.click(screen.getByRole("button", { name: "ДАЛЕЕ" }));
    expect(screen.getByText("Стр. 2 / 3")).toBeInTheDocument();
  });
});
