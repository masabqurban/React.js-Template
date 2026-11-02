import { expect, test } from "@playwright/test";

import { signIn } from "./helpers";

test.beforeEach(async ({ page }) => {
  await signIn(page, "/users");
});

test("search and filters live in the URL", async ({ page }) => {
  await page.getByRole("searchbox", { name: "Search users" }).fill("demo");
  await expect(page).toHaveURL(/q=demo/);
  await expect(page.getByRole("link", { name: "Demo Admin" })).toBeVisible();

  await page.getByLabel("Filter by role").selectOption("viewer");
  await expect(page).toHaveURL(/role=viewer/);
  await expect(page.getByText("No users found")).toBeVisible();

  // Reloading restores exactly the same view.
  await page.reload();
  await expect(page.getByLabel("Filter by role")).toHaveValue("viewer");
  await expect(
    page.getByRole("searchbox", { name: "Search users" }),
  ).toHaveValue("demo");
});

test("paginates through the list", async ({ page }) => {
  await expect(page.getByText(/Showing 1–10 of/)).toBeVisible();
  await page.getByRole("button", { name: "Next" }).click();
  await expect(page).toHaveURL(/page=2/);
  await expect(page.getByText(/Showing 11–20 of/)).toBeVisible();
});

test("creates, edits and deletes a user", async ({ page }) => {
  await page.getByRole("button", { name: "Add user" }).click();
  const dialog = page.getByRole("dialog", { name: "Add user" });
  await dialog.getByLabel("Full name").fill("Grace Hopper");
  await dialog.getByLabel("Email").fill("grace@example.com");
  await dialog.getByLabel("Role").selectOption("editor");
  await dialog.getByRole("button", { name: "Add user" }).click();
  await expect(dialog).toBeHidden();
  await expect(page.getByText("Grace Hopper was added.")).toBeVisible();

  await page.getByRole("link", { name: "Grace Hopper" }).click();
  await expect(
    page.getByRole("heading", { level: 1, name: "Grace Hopper" }),
  ).toBeVisible();

  await page.getByRole("button", { name: "Edit" }).click();
  const edit = page.getByRole("dialog", { name: "Edit user" });
  await edit.getByLabel("Full name").fill("Grace B. Hopper");
  await edit.getByRole("button", { name: "Save changes" }).click();
  await expect(
    page.getByRole("heading", { level: 1, name: "Grace B. Hopper" }),
  ).toBeVisible();

  await page.getByRole("button", { name: "Delete" }).click();
  await page
    .getByRole("alertdialog")
    .getByRole("button", { name: "Delete user" })
    .click();
  await expect(page).toHaveURL(/\/users$/);
  await expect(page.getByRole("link", { name: "Grace B. Hopper" })).toHaveCount(
    0,
  );
});

test("validates the form before submitting", async ({ page }) => {
  await page.getByRole("button", { name: "Add user" }).click();
  const dialog = page.getByRole("dialog", { name: "Add user" });
  await dialog.getByRole("button", { name: "Add user" }).click();
  await expect(
    dialog.getByText("Name must be at least 2 characters."),
  ).toBeVisible();
  await expect(dialog.getByLabel("Email")).toHaveAttribute(
    "aria-invalid",
    "true",
  );
});

test("an unknown user id shows a 404 page", async ({ page }) => {
  await page.goto("/users/usr_missing");
  await expect(
    page.getByRole("heading", { name: "Page not found" }),
  ).toBeVisible();
});
