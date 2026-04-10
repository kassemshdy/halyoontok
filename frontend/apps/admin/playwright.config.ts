import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  globalSetup: require.resolve("./tests/e2e/global-setup"),
  timeout: 60000,
  expect: { timeout: 10000 },
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 2 : undefined,
  reporter: [["list"]],
  testMatch: /.*\/tests\/e2e\/.*\.spec\.ts/,
  outputDir: "output/playwright",
  use: {
    baseURL: process.env.BASE_URL || "http://localhost:3000",
    trace: "retain-on-failure",
  },
  projects: [
    {
      name: "admin",
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 1280, height: 720 },
        storageState: "admin_auth.json",
      },
      grepInvert: [/@exclusive/],
    },
    {
      name: "exclusive",
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 1280, height: 720 },
        storageState: "admin_auth.json",
      },
      grep: /@exclusive/,
      workers: 1,
    },
  ],
});
