import { test, expect } from "@playwright/test";

test("now page shows the newest now post, not the oldest", async ({ page }) => {
  await page.goto("/now");
  await expect(page.getByRole("heading", { level: 1, name: "Now" })).toBeVisible();
  // posts/now/untitled.md (2026-08-17) is newer than posts/now/now.md (2026-07-08).
  await expect(page.getByRole("link", { name: "Golden Gate Half Marathon" })).toBeVisible();
  await expect(page.getByText("Last updated 2026-08-17")).toBeVisible();
  // A line unique to the older post must not be on the page.
  await expect(page.getByText("Beating Subnautica")).toHaveCount(0);
});

test("home intro renders from the home markdown collection", async ({ page }) => {
  await page.goto("/");
  const intro = page.locator(".home-intro");
  await expect(intro).toBeVisible();
  // Body prose and its inline link come from posts/home/home.md.
  await expect(
    intro.getByRole("link", { name: "University of Washington" }),
  ).toHaveAttribute("href", "https://www.washington.edu/");
  // The blockquote aside convention renders the quieter notes.
  await expect(intro.locator("blockquote").first()).toContainText(
    "to see what I've been up to lately",
  );
});

test("home intro links through to the now page", async ({ page }) => {
  await page.goto("/");
  await page.locator('.home-intro a[href="/now"]').click();
  await expect(page).toHaveURL(/\/now$/);
  await expect(page.getByRole("heading", { level: 1, name: "Now" })).toBeVisible();
});
