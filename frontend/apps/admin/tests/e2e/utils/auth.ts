import type { Page } from "@playwright/test";
import { TEST_ADMIN_CREDENTIALS, TEST_PARENT_CREDENTIALS } from "../constants";

/**
 * Log in via API and set token in localStorage.
 */
export async function apiLogin(page: Page, email: string, password: string): Promise<string> {
  const frontApiURL = process.env.FRONT_API_URL || "http://localhost:8081";
  const res = await page.request.post(`${frontApiURL}/api/auth/login`, {
    data: { email, password },
  });
  if (!res.ok()) {
    throw new Error(`API login failed for ${email}: ${res.status()}`);
  }
  const data = await res.json();
  return data.access_token;
}

export async function loginAs(page: Page, userType: "admin" | "parent"): Promise<void> {
  const creds = userType === "admin" ? TEST_ADMIN_CREDENTIALS : TEST_PARENT_CREDENTIALS;
  const token = await apiLogin(page, creds.email, creds.password);

  await page.evaluate(
    ({ token, email, role }) => {
      localStorage.setItem("admin_token", token);
      localStorage.setItem("admin_user", JSON.stringify({ id: 0, email, role, is_active: true }));
    },
    { token, email: creds.email, role: userType }
  );
}
