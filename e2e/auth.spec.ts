import { expect, test } from "@playwright/test";

import { DEMO, signIn } from "./helpers";

test("guests are sent to sign-in and returned to where they were going", async ({
  page,
}) => {
  await page.goto("/users?q=ava");
  await expect(page).toHaveURL(/\/login\?redirect=/);
  await expect(page).toHaveTitle(/Sign in/);

  await page.getByLabel("Email").fill(DEMO.email);
  await page.getByLabel("Password").fill(DEMO.password);
  await page.getByRole("button", { name: "Sign in" }).click();

  await expect(page).toHaveURL(/\/users\?q=ava$/);
  await expect(
    page.getByRole("heading", { level: 1, name: "Users" }),
  ).toBeVisible();
});

test("wrong credentials show an error and keep the email", async ({ page }) => {
  await page.goto("/login");
  await page.getByLabel("Email").fill(DEMO.email);
  await page.getByLabel("Password").fill("not-the-password");
  await page.getByRole("button", { name: "Sign in" }).click();

  await expect(
    page.getByRole("alert").filter({ hasText: "Incorrect" }),
  ).toBeVisible();
  await expect(page.getByLabel("Email")).toHaveValue(DEMO.email);
});

test("the session survives a reload, and signing out ends it", async ({
  page,
}) => {
  await signIn(page);
  await expect(
    page.getByRole("heading", { level: 1, name: "Dashboard" }),
  ).toBeVisible();

  await page.reload();
  await expect(
    page.getByRole("heading", { level: 1, name: "Dashboard" }),
  ).toBeVisible();

  await page.getByRole("button", { name: /account menu/i }).click();
  await page.getByRole("menuitem", { name: "Sign out" }).click();
  await expect(page).toHaveURL(/\/login/);

  await page.goto("/");
  await expect(page).toHaveURL(/\/login/);
});

test("unknown routes show a 404 page", async ({ page }) => {
  await signIn(page);
  await page.goto("/does-not-exist");
  await expect(
    page.getByRole("heading", { name: "Page not found" }),
  ).toBeVisible();
});
