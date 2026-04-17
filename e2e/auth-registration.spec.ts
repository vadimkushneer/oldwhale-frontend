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

const E2E_API_ORIGIN = "http://127.0.0.1:4173";
const MOCK_JWT = "e2e-register-jwt";

function registerUrl() {
  return `${E2E_API_ORIGIN}/api/auth/register`;
}

function meUrl() {
  return `${E2E_API_ORIGIN}/api/me`;
}

/** Stubs POST /api/auth/register and GET /api/me so post-auth restore succeeds on /editor. */
async function installRegisterSuccessMocks(page: Page, user: User) {
  await page.route(registerUrl(), async (route) => {
    if (route.request().method() !== "POST") {
      await route.fallback();
      return;
    }
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ token: MOCK_JWT, user }),
    });
  });

  await page.route(meUrl(), async (route) => {
    if (route.request().method() !== "GET") {
      await route.fallback();
      return;
    }
    const auth = route.request().headers()["authorization"] || "";
    if (!auth.includes(MOCK_JWT)) {
      await route.fulfill({ status: 401, contentType: "application/json", body: JSON.stringify({ error: "unauthorized" }) });
      return;
    }
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(user),
    });
  });
}

async function installRegisterErrorMock(page: Page, status: number, errorMessage: string) {
  await page.route(registerUrl(), async (route) => {
    if (route.request().method() !== "POST") {
      await route.fallback();
      return;
    }
    await route.fulfill({
      status,
      contentType: "application/json",
      body: JSON.stringify({ error: errorMessage }),
    });
  });
}

function seedProfileAndClearStorage(page: Page, mode: string) {
  return page.addInitScript((m) => {
    try {
      localStorage.clear();
    } catch {
      /* ignore */
    }
    try {
      localStorage.setItem("ow_profile", JSON.stringify({ mode: m }));
    } catch {
      /* ignore */
    }
  }, mode);
}

test.describe("auth / registration", () => {
  test("completes registration and lands on editor with token", async ({ page }) => {
    const suffix = `${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;
    const login = `e2e-reg-${suffix}`;
    const email = `e2e-reg-${suffix}@e2e.invalid`;
    const password = `pw-${suffix}`;

    const user: User = {
      id: 9001,
      login,
      email,
      role: "user",
      disabled: false,
      created_at: "2000-06-15T12:00:00.000Z",
    };

    await seedProfileAndClearStorage(page, "film");
    await installRegisterSuccessMocks(page, user);
    await page.goto("/login");

    await page.getByRole("button", { name: "РЕГИСТРАЦИЯ" }).click();
    await page.getByPlaceholder("логин").fill(login);
    await page.getByPlaceholder("email").fill(email);
    await page.getByPlaceholder("пароль").fill(password);
    await page.getByRole("button", { name: "СОЗДАТЬ АККАУНТ" }).click();

    await page.waitForURL("**/editor", { timeout: 30_000 });
    const token = await page.evaluate(() => localStorage.getItem("ow_token"));
    expect(token).toBe(MOCK_JWT);
  });

  test("shows API error and stays on login", async ({ page }) => {
    const suffix = `${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;
    const login = `e2e-err-${suffix}`;
    const email = `e2e-err-${suffix}@e2e.invalid`;
    const password = `pw-${suffix}`;
    const errorText = "e2e-duplicate";

    await seedProfileAndClearStorage(page, "film");
    await installRegisterErrorMock(page, 409, errorText);
    await page.goto("/login");

    await page.getByRole("button", { name: "РЕГИСТРАЦИЯ" }).click();
    await page.getByPlaceholder("логин").fill(login);
    await page.getByPlaceholder("email").fill(email);
    await page.getByPlaceholder("пароль").fill(password);
    await page.getByRole("button", { name: "СОЗДАТЬ АККАУНТ" }).click();

    await expect(page.getByText(errorText)).toBeVisible();
    await expect(page).toHaveURL(/\/login$/);
  });
});
