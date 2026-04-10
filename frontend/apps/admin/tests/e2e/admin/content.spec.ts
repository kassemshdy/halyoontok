import { test, expect } from "@playwright/test";

test.use({ storageState: "admin_auth.json" });

test.describe("Content Management", () => {
  test("content page loads without error", async ({ page }) => {
    await page.goto("/content");
    await page.waitForTimeout(2000);
    await expect(page.locator("text=Something went wrong")).not.toBeVisible();
  });

  test("upload page loads without error", async ({ page }) => {
    await page.goto("/content/upload");
    await page.waitForTimeout(2000);
    await expect(page.locator("text=Something went wrong")).not.toBeVisible();
  });
});
