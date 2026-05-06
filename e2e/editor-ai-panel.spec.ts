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
              uid: "dddddddd-dddd-4ddd-8ddd-dddddddddddd",
              slug: "deepseek",
              label: "DeepSeek",
              role: "Черновик",
              color: "#4ade80",
              free: true,
              created_at: "2025-01-01T00:00:00Z",
              updated_at: "2025-01-01T00:00:00Z",
              variants: [
                {
                  uid: "11111111-1111-4111-8111-111111111111",
                  slug: "deepseek-v3-2",
                  label: "V3.2",
                  is_default: true,
                  created_at: "2025-01-01T00:00:00Z",
                  updated_at: "2025-01-01T00:00:00Z",
                },
              ],
            },
            {
              uid: "cccccccc-cccc-4ccc-8ccc-cccccccccccc",
              slug: "claude",
              label: "Claude",
              role: "Редактура",
              color: "#7c6af7",
              free: false,
              created_at: "2025-01-01T00:00:00Z",
              updated_at: "2025-01-01T00:00:00Z",
              variants: [
                {
                  uid: CLAUDE_OPUS_GUID,
                  slug: "claude-opus-4-6",
                  label: "Opus 4.6",
                  is_default: true,
                  created_at: "2025-01-01T00:00:00Z",
                  updated_at: "2025-01-01T00:00:00Z",
                },
              ],
            },
          ],
        }),
      });
    });
    await page.route("**/api/ai/chat", async (route) => {
      const postData = route.request().postDataJSON() as Record<string, unknown>;
      expect(postData.editor_mode).toBe("note");
      expect(postData.group_uid).toBe("cccccccc-cccc-4ccc-8ccc-cccccccccccc");
      expect(postData.variant_uid).toBe(CLAUDE_OPUS_GUID);
      expect(postData.note_context).toBeTruthy();
      expect(
        Array.isArray((postData.note_context as { conversationHistory?: unknown }).conversationHistory),
      ).toBe(true);
      expect(typeof (postData.note_context as { workfieldHtml?: unknown }).workfieldHtml).toBe("string");
      await route.fulfill({
        status: 202,
        contentType: "application/json",
        body: JSON.stringify({
          request_uid: "33333333-3333-4333-8333-333333333333",
          user_message_uid: "11111111-1111-4111-8111-111111111111",
          assistant_message_uid: "22222222-2222-4222-8222-222222222222",
        }),
      });
    });
    await page.route("**/api/ai/chat/events?**", async (route) => {
      expect(route.request().url()).toContain("request_uid=33333333-3333-4333-8333-333333333333");
      await route.fulfill({
        status: 200,
        contentType: "text/event-stream",
        body:
          'event: ready\n' +
          'data: {"request_uid":"33333333-3333-4333-8333-333333333333","reply":"HELLO FROM OLD WHALE","user_message_uid":"11111111-1111-4111-8111-111111111111","assistant_message_uid":"22222222-2222-4222-8222-222222222222"}\n\n',
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
