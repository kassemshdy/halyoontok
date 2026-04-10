import { FullConfig, request } from "@playwright/test";
import { TEST_ADMIN_CREDENTIALS, TEST_PARENT_CREDENTIALS } from "./constants";

const PREFLIGHT_TIMEOUT_MS = 30_000;
const PREFLIGHT_POLL_INTERVAL_MS = 2_000;

async function waitForServer(baseURL: string): Promise<void> {
  const deadline = Date.now() + PREFLIGHT_TIMEOUT_MS;
  console.log(`[global-setup] Waiting for server at ${baseURL} ...`);

  while (Date.now() < deadline) {
    try {
      const res = await fetch(baseURL);
      if (res.ok || res.status === 200 || res.status === 302) {
        console.log("[global-setup] Server is ready.");
        return;
      }
    } catch {}
    await new Promise((r) => setTimeout(r, PREFLIGHT_POLL_INTERVAL_MS));
  }
  throw new Error(`Server not ready at ${baseURL} after ${PREFLIGHT_TIMEOUT_MS / 1000}s`);
}

async function ensureUserExists(apiBase: string, email: string, password: string, role: string): Promise<void> {
  const ctx = await request.newContext({ baseURL: apiBase });
  try {
    const res = await ctx.post("/api/auth/register", {
      data: { email, password, role },
    });
    if (res.ok()) {
      console.log(`[global-setup] Registered ${email} (${role})`);
    } else {
      const body = await res.text();
      if (body.includes("already registered")) {
        console.log(`[global-setup] ${email} already exists, skipping.`);
      } else {
        console.warn(`[global-setup] Register ${email}: ${res.status()} ${body}`);
      }
    }
  } finally {
    await ctx.dispose();
  }
}

async function apiLoginAndSaveState(baseURL: string, email: string, password: string, path: string): Promise<void> {
  const ctx = await request.newContext({ baseURL });
  try {
    const res = await ctx.post("/api/auth/login", {
      data: { email, password },
    });
    if (!res.ok()) {
      const body = await res.text();
      throw new Error(`Login failed for ${email}: ${res.status()} ${body}`);
    }
    // Store the JWT token in localStorage via storageState
    const data = await res.json();
    const token = data.access_token;

    // Save as storage state with the token in origins localStorage
    const storageState = {
      cookies: [],
      origins: [
        {
          origin: baseURL,
          localStorage: [
            { name: "admin_token", value: token },
            { name: "admin_user", value: JSON.stringify({ id: 0, email, role: "admin", is_active: true }) },
          ],
        },
      ],
    };
    const fs = require("fs");
    fs.writeFileSync(path, JSON.stringify(storageState));
    console.log(`[global-setup] Saved auth state for ${email} → ${path}`);
  } finally {
    await ctx.dispose();
  }
}

async function globalSetup(config: FullConfig) {
  const baseURL = config.projects[0]?.use?.baseURL || "http://localhost:3000";
  // front-api for auth (admin app proxies /api/auth to front-api)
  const frontApiURL = process.env.FRONT_API_URL || "http://localhost:8081";

  await waitForServer(baseURL);

  // Register test users via front-api directly
  await ensureUserExists(frontApiURL, TEST_ADMIN_CREDENTIALS.email, TEST_ADMIN_CREDENTIALS.password, "admin");
  await ensureUserExists(frontApiURL, TEST_PARENT_CREDENTIALS.email, TEST_PARENT_CREDENTIALS.password, "parent");

  // Login and save storage state
  await apiLoginAndSaveState(frontApiURL, TEST_ADMIN_CREDENTIALS.email, TEST_ADMIN_CREDENTIALS.password, "admin_auth.json");
}

export default globalSetup;
