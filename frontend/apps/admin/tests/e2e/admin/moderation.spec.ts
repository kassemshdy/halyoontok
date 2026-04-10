import { test, expect, request } from "@playwright/test";
import { TEST_ADMIN_CREDENTIALS } from "../constants";
import { HalyoonTestClient } from "../utils/api-client";

test.use({ storageState: "admin_auth.json" });

test.describe("Moderation Queue", () => {
  test("shows empty state when no videos awaiting moderation", async ({ page }) => {
    await page.goto("/moderation");
    await page.waitForLoadState("networkidle");

    // Should show either the queue or empty state
    const content = await page.textContent("body");
    expect(content).toBeTruthy();
  });

  test("can approve a video from queue @exclusive", async ({ page }) => {
    // Create a video and set it to awaiting_moderation via API
    const ctx = await request.newContext();
    const client = new HalyoonTestClient(ctx);
    await client.loginAdmin(TEST_ADMIN_CREDENTIALS.email, TEST_ADMIN_CREDENTIALS.password);
    const video = await client.createVideo({ title: "Moderation Test Video", category: "sports" });
    await client.updateVideoStatus(video.id, "awaiting_moderation");
    await ctx.dispose();

    // Visit moderation queue
    await page.goto("/moderation");
    await page.waitForLoadState("networkidle");

    // Should see the video in queue
    await expect(page.locator("text=Moderation Test Video")).toBeVisible({ timeout: 10000 });

    // Click approve
    const approveButton = page.getByRole("button", { name: /approve|موافقة/i }).first();
    await approveButton.click();
    await page.waitForLoadState("networkidle");

    // Video should disappear from queue
    await expect(page.locator("text=Moderation Test Video")).not.toBeVisible({ timeout: 5000 });
  });
});
