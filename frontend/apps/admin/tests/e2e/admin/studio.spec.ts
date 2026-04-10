import { test, expect } from "@playwright/test";

test.use({ storageState: "admin_auth.json" });

test.describe("Studio", () => {
  test("studio page loads without error", async ({ page }) => {
    await page.goto("/studio");
    await page.waitForTimeout(2000);
    await expect(page.locator("text=Something went wrong")).not.toBeVisible();
  });
});
