import { expect, type Page } from "@playwright/test";

export const DEMO = { email: "demo@example.com", password: "password123" };

/** Signs in through the real login form (the mock API accepts the demo account). */
export async function signIn(page: Page, path = "/") {
  await page.goto(path);
  await expect(page.getByRole("heading", { name: "Sign in" })).toBeVisible();
  await page.getByLabel("Email").fill(DEMO.email);
  await page.getByLabel("Password").fill(DEMO.password);
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page.getByRole("heading", { level: 1 })).not.toHaveText(
    "Sign in",
  );
}
