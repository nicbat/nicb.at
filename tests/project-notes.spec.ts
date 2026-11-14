import { expect, test } from "@playwright/test";
import projectData from "../src/assets/media_manager/records/projects/data.json" with { type: "json" };

const projects = projectData.records;
const featured = projects.filter(p => p.featured);

test("a note picks up to show its full description and links, and sticks back", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", error => errors.push(error.message));
  await page.goto("/projects");
  const project = projects.find(p => p.urls?.length && p.description)!;
  const note = page.getByRole("button", { name: project.name, exact: true });
  await note.click();

  const dialog = page.getByRole("dialog", { name: project.name });
  await expect(dialog).toBeVisible();
  for (const url of project.urls) {
    await expect(dialog.getByRole("link", { name: `→ ${url.display_name}` })).toHaveAttribute("href", url.url);
  }
  // While it's picked up, only a faint mark is left on the page.
  await expect(page.locator(".note-wrap.picked")).toHaveCount(1);

  await page.keyboard.press("Escape");
  await expect(dialog).toHaveCount(0);
  await expect(page.locator(".note-wrap.picked")).toHaveCount(0);
  await expect(note).toBeFocused();

  // The "stick it back" button works too.
  await note.click();
  await page.getByRole("button", { name: "stick it back" }).click();
  await expect(page.getByRole("dialog")).toHaveCount(0);
  expect(errors).toEqual([]);
});

test("the pile spreads out into the grid and gathers back up", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", error => errors.push(error.message));
  await page.goto("/");
  const pile = page.getByRole("link", { name: "See all projects" });
  await pile.scrollIntoViewIfNeeded();
  const pileBox = (await pile.locator(".pile").boundingBox())!;
  await pile.click();
  await expect(page).toHaveURL(/\/projects$/);

  // Mid-flight a piled note is smaller than its spot in the grid, then lands at full size.
  const grid = page.locator(".note-grid");
  await expect(grid.locator("button.note")).toHaveCount(projects.length);
  const lastNote = grid.locator(".note-wrap").last();
  await page.waitForTimeout(1600);
  const landed = (await lastNote.boundingBox())!;
  expect(landed.width).toBeGreaterThan(pileBox.width);

  await page.getByRole("link", { name: "Back to home" }).click();
  await expect(page).toHaveURL(/\/$/);
  await expect(page.locator(".featured-notes button.note")).toHaveCount(featured.length);
  expect(errors).toEqual([]);
});

test("project notes fit a phone", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/projects");
  await expect(page.locator(".note-grid button.note").first()).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
  await page.goto("/");
  const section = page.getByRole("region", { name: "Projects", exact: true });
  await section.scrollIntoViewIfNeeded();
  await expect(section.getByRole("link", { name: "See all projects" })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
});
