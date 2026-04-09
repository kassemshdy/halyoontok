# Playwright E2E Testing Skill

## Project Layout

```
admin/tests/e2e/              # All E2E tests
├── auth/                     # Authentication tests
├── studio/                   # Studio workflow tests
├── moderation/               # Moderation queue tests
├── content/                  # Content management tests
├── feed/                     # Feed behavior tests
├── parent-controls/          # Parent controls tests
├── utils/                    # Shared test utilities
├── constants.ts              # Shared constants
├── global-setup.ts           # Global test setup
admin/playwright.config.ts    # Playwright configuration
admin/output/playwright/      # Test output (gitignored)
```

## Import Convention

Always use absolute `@tests/e2e/` imports — never relative paths.

```typescript
import { apiClient } from "@tests/e2e/utils/api-client";
import { ADMIN_USER } from "@tests/e2e/constants";
```

## Running Tests

```bash
cd admin
npx playwright test                          # Run all tests
npx playwright test <TEST_NAME>              # Run specific test
npx playwright test --project admin          # Standard parallel tests
npx playwright test --project exclusive      # Serial/slow tests
npx playwright test --headed                 # Run with browser visible
npx playwright test --ui                     # Interactive UI mode
```

## Test Projects

| Project | Purpose | Workers | Tags |
|---------|---------|---------|------|
| `admin` | Standard tests, run in parallel | multiple | excludes `@exclusive` |
| `exclusive` | Serial/slow tests | 1 | `@exclusive` tag only |

## Authentication Strategy

- Global setup creates storage states for test users
- Tests run pre-authenticated as admin by default
- Admin user: `admin@halyoontok.test` / `admin123`
- Parent user: `parent@halyoontok.test` / `parent123`
- Moderator user: `moderator@halyoontok.test` / `moderator123`

```typescript
// Switch to a different user in a test
await loginAs(page, "parent");
```

## Test Utilities

### HalyoonApiClient
Backend API client for test setup/teardown — create videos, users, profiles via API before testing UI.

```typescript
const api = new HalyoonApiClient();
const video = await api.createVideo({ title: "Test Video", category: "humor" });
// ... test UI ...
await api.deleteVideo(video.id);  // cleanup
```

### Locator Strategy (Priority Order)
1. `data-testid` / `aria-label` — most stable
2. Role-based selectors — `page.getByRole("button", { name: "Publish" })`
3. Text/Label selectors — `page.getByText("Moderation Queue")`
4. CSS selectors — last resort only

## Best Practices

- **Descriptive test names** — `test("moderator can approve video from queue")`
- **API-first setup** — use `HalyoonApiClient` for test data, not UI clicks
- **User isolation** — each test creates its own data, cleans up after
- **Web-first assertions** — use `expect(locator).toBeVisible()` with auto-retry
- **No hardcoded waits** — never use `page.waitForTimeout()`, use `expect` with auto-retry
- **Parallel-safe** — no shared mutable state between tests
- **RTL-aware** — test with `dir="rtl"`, use logical properties
- **Tag slow tests** — mark with `@exclusive` to run serially

## Writing a New Test

```typescript
import { test, expect } from "@playwright/test";

test.describe("Moderation Queue", () => {
  test("moderator can approve a video", async ({ page }) => {
    // Setup via API
    const api = new HalyoonApiClient();
    const video = await api.createVideo({
      title: "Test",
      status: "awaiting_moderation",
    });

    // Test UI
    await page.goto("/moderation");
    await expect(page.getByText("Test")).toBeVisible();
    await page.getByRole("button", { name: "Approve" }).click();
    await expect(page.getByText("Approved")).toBeVisible();

    // Cleanup
    await api.deleteVideo(video.id);
  });
});
```
