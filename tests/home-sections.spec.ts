import { expect, test } from "@playwright/test";
import favoriteData from "../src/assets/media_manager/media/classes/favorites.json" with { type: "json" };
import projectData from "../src/assets/media_manager/records/projects/data.json" with { type: "json" };

const favorites = favoriteData.records;
const projects = projectData.records;

test("home shows only featured projects and links to the complete list", async ({ page }) => {
  await page.goto("/");
  const section = page.getByRole("region", { name: "Projects", exact: true });
  await expect(section.locator(".project-content")).toHaveCount(projects.filter(p => p.featured).length);
  for (const project of projects) {
    await expect(section.getByText(project.name, { exact: true })).toHaveCount(project.featured ? 1 : 0);
  }
  await section.getByRole("link", { name: "See all projects" }).click();
  await expect(page).toHaveURL(/\/projects$/);
  await expect(page.locator(".project-content")).toHaveCount(projects.length);
  await page.getByRole("link", { name: "Back to home" }).click();
  await expect(page).toHaveURL(/\/$/);
  await expect(page.getByRole("navigation")).toHaveCount(0);
  await expect(page.locator(".mountains")).toHaveCount(0);
  await page.getByRole("link", { name: "write from time to time" }).click();
  await expect(page).toHaveURL(/\/words$/);
  await expect(page.getByRole("heading", { name: "Words", exact: true })).toBeVisible();
});

test("home Favorites use class names for hover and keyboard tooltips", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", error => errors.push(error.message));
  await page.goto("/");
  const section = page.getByRole("region", { name: "Photos", exact: true });
  await expect(section.locator(".gallery-item")).toHaveCount(Object.keys(favorites).length);
  for (const photo of Object.values(favorites).filter(p => p.name)) {
    await expect(section.getByRole("img", { name: photo.name, exact: true })).toHaveCount(1);
  }
  const name = Object.values(favorites).find(p => p.name)!.name;
  const tile = section.getByRole("button", { name, exact: true });
  const tooltip = tile.getByRole("tooltip");
  await tile.hover();
  await expect(tooltip).toHaveCSS("opacity", "1");
  await page.mouse.move(0, 0);
  await tile.focus();
  await expect(tooltip).toHaveCSS("opacity", "1");
  await tile.click();
  await expect(page.locator(".fixed.inset-0").getByText(name, { exact: true })).toBeVisible();
  expect(errors).toEqual([]);
});

test("footer text button switches themes and persists across navigation and reload", async ({ page }) => {
  await page.addInitScript(() => {
    if (!localStorage.getItem("theme")) localStorage.setItem("theme", "light");
  });
  await page.goto("/");
  const footer = page.getByRole("contentinfo");
  await footer.getByRole("button", { name: "dark mode", exact: true }).click();
  await expect(page.locator("html")).toHaveClass(/dark/);
  await expect(footer.getByRole("button", { name: "light mode", exact: true })).toBeVisible();
  await page.goto("/projects");
  await expect(page.locator("html")).toHaveClass(/dark/);
  await page.reload();
  await expect(page.locator("html")).toHaveClass(/dark/);
  await footer.getByRole("button", { name: "light mode", exact: true }).click();
  await expect(page.locator("html")).not.toHaveClass(/dark/);
  await expect(page.getByRole("navigation")).toHaveCount(0);
});

test("home fits a narrow mobile viewport", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  const photos = page.getByRole("region", { name: "Photos", exact: true });
  await photos.scrollIntoViewIfNeeded();
  await expect(photos.locator(".gallery-item").first()).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
  await page.getByRole("contentinfo").scrollIntoViewIfNeeded();
  await expect(page.getByRole("contentinfo").getByRole("button", { name: /mode$/ })).toBeVisible();
});
