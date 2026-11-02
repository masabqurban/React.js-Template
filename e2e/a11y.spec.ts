import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

import { signIn } from "./helpers";

async function seriousViolations(page: Page) {
  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
    // Dev tools are not part of the shipped UI.
    .exclude(".tsqd-parent-container")
    .analyze();
  return results.violations
    .filter((v) => v.impact === "serious" || v.impact === "critical")
    .map(({ id, help, nodes }) => ({
      id,
      help,
      targets: nodes.map((n) => n.target),
    }));
}

const screens = [
  { path: "/", heading: "Dashboard" },
  { path: "/users", heading: "Users" },
  { path: "/users/usr_0001", heading: "Demo Admin" },
  { path: "/settings", heading: "Settings" },
];

// The theme can be light, dark or follow the OS, so contrast is checked in both.
for (const colorScheme of ["light", "dark"] as const) {
  test.describe(`${colorScheme} mode`, () => {
    test.use({ colorScheme });

    test("sign-in page has no serious violations", async ({ page }) => {
      await page.goto("/login");
      await expect(
        page.getByRole("heading", { name: "Sign in" }),
      ).toBeVisible();
      expect(await seriousViolations(page)).toEqual([]);
    });

    test("signed-in screens have no serious violations", async ({ page }) => {
      await signIn(page);
      for (const { path, heading } of screens) {
        await page.goto(path);
        await expect(
          page.getByRole("heading", { level: 1, name: heading }),
        ).toBeVisible();
        expect(await seriousViolations(page), path).toEqual([]);
      }
    });
  });
}
