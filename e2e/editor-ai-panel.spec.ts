import { test, expect } from "@playwright/test";

const CLAUDE_OPUS_GUID = "33333333-3333-4333-8333-333333333333";

test.describe("editor / AI panel", () => {
  test("guest: model switch, send message, collapse panel", async ({ page }) => {
    await page.route("**/api/ai/models", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          groups: [
            {
              id: 1,
              slug: "deepseek",
              label: "DeepSeek",
              role: "Черновик",
              color: "#4ade80",
              free: true,
              variants: [
                {
                  id: 10,
                  guid: "11111111-1111-4111-8111-111111111111",
                  slug: "deepseek-v3-2",
                  label: "V3.2",
                  is_default: true,
                },
              ],
            },
            {
              id: 2,
              slug: "claude",
              label: "Claude",
              role: "Редактура",
              color: "#7c6af7",
              free: false,
              variants: [
                {
                  id: 20,
                  guid: CLAUDE_OPUS_GUID,
                  slug: "claude-opus-4-6",
                  label: "Opus 4.6",
                  is_default: true,
                },
              ],
            },
          ],
        }),
      });
    });
    await page.route("**/api/ai/chat", async (route) => {
      const postData = route.request().postDataJSON() as Record<string, unknown>;
      expect(postData.editorMode).toBe("note");
      expect(postData.variantGuid).toBe(CLAUDE_OPUS_GUID);
      expect(postData.variantSlug).toBeUndefined();
      expect(postData.noteContext).toBeTruthy();
      expect(Array.isArray((postData.noteContext as { conversationHistory?: unknown }).conversationHistory)).toBe(
        true,
      );
      expect(
        typeof (postData.noteContext as { workfieldHtml?: unknown }).workfieldHtml,
      ).toBe("string");
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          reply: "HELLO FROM OLD WHALE",
          userMessageId: "11111111-1111-4111-8111-111111111111",
          assistantMessageId: "22222222-2222-4222-8222-222222222222",
        }),
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
    const lastAiMsg = page.locator('article[data-chat-message-type="ai"]').last();
    await expect(lastAiMsg).toBeVisible({ timeout: 12_000 });
    const reply = await lastAiMsg.locator(".chat-message__body").innerText();
    expect(reply.trim()).toBe("HELLO FROM OLD WHALE");

    await page.getByTitle("Свернуть ИИ-панель").click();
    await expect(page.getByTitle("Развернуть ИИ-панель")).toBeVisible();
  });
});
