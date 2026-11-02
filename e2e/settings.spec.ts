import { expect, test } from "@playwright/test";

import { signIn } from "./helpers";

test("the theme choice applies instantly and survives a reload", async ({
  page,
}) => {
  await signIn(page, "/settings");
  const html = page.locator("html");

  await page.getByText("Dark", { exact: true }).click();
  await expect(html).toHaveClass(/dark/);

  await page.reload();
  // Applied by public/theme-init.js before React loads: no flash of light theme.
  await expect(html).toHaveClass(/dark/);

  await page.getByText("Light", { exact: true }).click();
  await expect(html).not.toHaveClass(/dark/);
});

test("profile changes update the account menu", async ({ page }) => {
  await signIn(page, "/settings");
  await page.getByLabel("Full name").fill("Demo Owner");
  await page.getByRole("button", { name: "Save profile" }).click();

  await expect(page.getByText("Profile updated.")).toBeVisible();
  await expect(
    page.getByRole("button", { name: /account menu/i }),
  ).toContainText("DO");
});
