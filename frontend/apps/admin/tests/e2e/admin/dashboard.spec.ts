import { test, expect } from "@playwright/test";

test.use({ storageState: "admin_auth.json" });

test.describe("Dashboard", () => {
  test("page loads without error", async ({ page }) => {
    await page.goto("/");
    await page.waitForTimeout(2000);
    const body = await page.textContent("body");
    expect(body!.length).toBeGreaterThan(20);
    await expect(page.locator("text=Something went wrong")).not.toBeVisible();
  });
});
