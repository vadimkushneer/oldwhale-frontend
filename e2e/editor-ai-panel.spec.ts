import { test, expect } from "@playwright/test";

test.describe("editor / AI panel", () => {
  test("guest: model switch, send message, collapse panel", async ({ page }) => {
    await page.route("**/api/ai/chat", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ reply: "HELLO FROM OLD WHALE" }),
      });
    });
    await page.addInitScript(() => {
      try {
        localStorage.clear();
      } catch {
        /* ignore */
      }
      localStorage.setItem("ow_profile", JSON.stringify({ mode: "note" }));
    });
    await page.goto("/editor", { waitUntil: "load", timeout: 90_000 });
    await expect(page.getByText("ИИ МОДЕЛИ")).toBeVisible({ timeout: 30_000 });

    await page.locator('button.ai-model-selector__row[data-provider="claude"]').click();

    const ta = page.locator(".ai-composer__textarea");
    await ta.fill("Hello e2e");
    await page.locator(".ai-composer__flat-button--send").click();

    await expect(page.getByText("Hello e2e")).toBeVisible();
    const lastAiBubble = page.locator(".ai-message-list__bubble--ai").last();
    await expect(lastAiBubble).toBeVisible({ timeout: 12_000 });
    const reply = await lastAiBubble.innerText();
    expect(reply.trim()).toBe("HELLO FROM OLD WHALE");

    await page.getByTitle("Свернуть ИИ-панель").click();
    await expect(page.getByTitle("Развернуть ИИ-панель")).toBeVisible();
  });
});
