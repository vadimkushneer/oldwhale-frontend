import { test, expect, type Page } from "@playwright/test";

type UserRole = "user" | "admin";

type User = {
  id: number;
  login: string;
  email: string;
  role: UserRole;
  disabled: boolean;
  created_at: string;
};

const fixedCreatedAt = "2000-06-15T12:00:00.000Z";

const mockAdmin: User = {
  id: 1,
  login: "e2e-admin",
  email: "admin@e2e.invalid",
  role: "admin",
  disabled: false,
  created_at: fixedCreatedAt,
};

const mockRegular: User = {
  id: 2,
  login: "e2e-user",
  email: "user@e2e.invalid",
  role: "user",
  disabled: false,
  created_at: fixedCreatedAt,
};

const E2E_API_ORIGIN = "http://127.0.0.1:4173";

async function installApiMocks(page: Page, options: { me: User; users?: User[] }) {
  await page.route(`${E2E_API_ORIGIN}/api/me`, async (route) => {
    if (route.request().method() !== "GET") {
      await route.fallback();
      return;
    }
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(options.me),
    });
  });

  const users = options.users;
  if (!users) return;

  await page.route(`${E2E_API_ORIGIN}/api/admin/users`, async (route) => {
    const method = route.request().method();
    if (method === "GET") {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ users }),
      });
      return;
    }
    if (method === "POST") {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ user: users[0] }),
      });
      return;
    }
    await route.fallback();
  });

  await page.route(new RegExp(`^${E2E_API_ORIGIN.replace(/\./g, "\\.")}/api/admin/users/\\d+$`), async (route) => {
    const method = route.request().method();
    if (method === "PATCH") {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ user: users[0] }),
      });
      return;
    }
    if (method === "DELETE") {
      await route.fulfill({ status: 204, body: "" });
      return;
    }
    await route.fallback();
  });
}

const shot = { fullPage: true as const, animations: "disabled" as const };

test.describe("visual / routes", () => {
  test("onboarding /", async ({ page }) => {
    await page.addInitScript(() => {
      try {
        localStorage.clear();
      } catch {
        /* ignore */
      }
    });
    await page.goto("/");
    await expect(page).toHaveScreenshot("onboarding.png", shot);
  });

  test("login /login", async ({ page }) => {
    await page.addInitScript(() => {
      try {
        localStorage.clear();
      } catch {
        /* ignore */
      }
    });
    await page.goto("/login");
    await expect(page).toHaveScreenshot("login.png", shot);
  });

  test("editor guest /editor (note profile)", async ({ page }) => {
    await page.addInitScript(() => {
      try {
        localStorage.clear();
      } catch {
        /* ignore */
      }
      localStorage.setItem("ow_profile", JSON.stringify({ mode: "note" }));
    });
    await page.goto("/editor", { waitUntil: "load", timeout: 90_000 });
    await page.waitForLoadState("networkidle").catch(() => undefined);
    await expect(page).toHaveScreenshot("editor-guest.png", shot);
  });

  test("admin /admin", async ({ page }) => {
    await page.addInitScript(() => {
      try {
        localStorage.clear();
      } catch {
        /* ignore */
      }
      localStorage.setItem("ow_token", "e2e-mock-jwt");
    });
    await installApiMocks(page, { me: mockAdmin, users: [mockAdmin, mockRegular] });
    await page.goto("/admin");
    await expect(page.getByText("АДМИН · ПОЛЬЗОВАТЕЛИ")).toBeVisible();
    await expect(page.locator("table")).toBeVisible();
    await expect(page).toHaveScreenshot("admin.png", shot);
  });

  test("admin insufficient rights /admin", async ({ page }) => {
    await page.addInitScript(() => {
      try {
        localStorage.clear();
      } catch {
        /* ignore */
      }
      localStorage.setItem("ow_token", "e2e-mock-jwt");
    });
    await installApiMocks(page, { me: mockRegular });
    await page.goto("/admin");
    await expect(page.getByText("НЕДОСТАТОЧНО ПРАВ")).toBeVisible();
    await expect(page).toHaveScreenshot("admin-insufficient.png", shot);
  });
});
