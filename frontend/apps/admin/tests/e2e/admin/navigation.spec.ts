import { test, expect } from "@playwright/test";

test.use({ storageState: "admin_auth.json" });

test.describe("Navigation", () => {
  const pages = [
    { path: "/", name: "Dashboard" },
    { path: "/content", name: "Content" },
    { path: "/moderation", name: "Moderation" },
    { path: "/studio", name: "Studio" },
    { path: "/trends", name: "Trends" },
    { path: "/analytics", name: "Analytics" },
    { path: "/parents", name: "Parents" },
  ];

  for (const p of pages) {
    test(`${p.name} page loads without error`, async ({ page }) => {
      await page.goto(p.path);

      // Should not show error page
      await expect(page.locator("text=Something went wrong")).not.toBeVisible({ timeout: 5000 });

      // Should have rendered content (not blank)
      const body = await page.textContent("body");
      expect(body!.length).toBeGreaterThan(10);
    });
  }

  test("sidebar links navigate correctly", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // Click content link in sidebar
    const contentLink = page.locator('aside a[href="/content"]');
    if (await contentLink.isVisible()) {
      await contentLink.click();
      await expect(page).toHaveURL("/content");
    }
  });
});
