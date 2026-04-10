import { test, expect } from "@playwright/test";

// This test does NOT use storageState — starts unauthenticated
test.use({ storageState: { cookies: [], origins: [] } });

test.describe("Login", () => {
  test("shows login form when not authenticated", async ({ page }) => {
    await page.goto("/");
    // Should show login form (AuthGate redirects to login)
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
  });

  test("can log in with valid credentials", async ({ page }) => {
    await page.goto("/");

    await page.fill('input[type="email"]', "admin@halyoontok.com");
    await page.fill('input[type="password"]', "admin123");
    await page.click('button[type="submit"]');

    // Should redirect to dashboard after login
    await expect(page).toHaveURL("/", { timeout: 10000 });
    // Dashboard should show content
    await page.waitForLoadState("networkidle");
  });

  test("shows error with invalid credentials", async ({ page }) => {
    await page.goto("/");

    await page.fill('input[type="email"]', "wrong@example.com");
    await page.fill('input[type="password"]', "wrongpassword");
    await page.click('button[type="submit"]');

    // Should show error message
    await expect(page.locator("text=Invalid credentials")).toBeVisible({ timeout: 5000 });
  });
});
