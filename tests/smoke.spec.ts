import { test, expect } from "@playwright/test";

test("home renders intro heading", async ({ page }) => {
  await page.goto("/");
  await expect(
    page.getByRole("heading", { level: 1, name: "Hey, it's Nicholas" }),
  ).toBeVisible();
});

test("words index lists only published posts", async ({ page }) => {
  await page.goto("/words");
  await expect(page.getByRole("heading", { level: 1, name: "Words" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Lazy Loading" })).toBeVisible();
  // Lego Death Star is unpublished — it must not appear in the index.
  await expect(page.getByRole("link", { name: "Lego Death Star" })).toHaveCount(0);
});

test("unpublished post route returns 404", async ({ page }) => {
  const response = await page.goto("/words/lego-death-star");
  expect(response?.status()).toBe(404);
});

test("projects renders heading", async ({ page }) => {
  await page.goto("/projects");
  await expect(page.getByRole("heading", { level: 1, name: "Projects" })).toBeVisible();
});

test("photos renders heading", async ({ page }) => {
  await page.goto("/photos");
  await expect(page.getByRole("heading", { level: 1, name: "Photos" })).toBeVisible();
});

test("travel renders heading", async ({ page }) => {
  await page.goto("/travel");
  await expect(page.getByRole("heading", { level: 1, name: "Travel" })).toBeVisible();
});

test("navigates into a trip", async ({ page }) => {
  await page.goto("/travel");
  await page.locator('a[href="/travel/vienna-2025"]').click();
  await expect(page).toHaveURL(/\/travel\/vienna-2025$/);
  await expect(
    page.getByRole("heading", { level: 1, name: "Vienna and Bratislava" }),
  ).toBeVisible();
});

test("unknown trip slug returns 404", async ({ page }) => {
  const response = await page.goto("/travel/does-not-exist");
  expect(response?.status()).toBe(404);
});

test("navigates into a blog post", async ({ page }) => {
  await page.goto("/words");
  await page.getByRole("link", { name: "Lazy Loading" }).click();
  await expect(page).toHaveURL(/\/words\/lazy-loading$/);
  await expect(
    page.getByRole("heading", { level: 1, name: "Lazy Loading" }),
  ).toBeVisible();
});

test("unknown post slug returns 404", async ({ page }) => {
  const response = await page.goto("/words/does-not-exist");
  expect(response?.status()).toBe(404);
});
