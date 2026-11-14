import { expect, test } from "@playwright/test";

// Masonry columns are separate DOM containers, so native Tab would run down a column. Gallery.svelte
// reroutes Tab to follow photo order (left to right across the rows), and lets it leave at the ends.
const focusedIndex = (page: import("@playwright/test").Page) =>
  page.evaluate(() => document.activeElement?.closest<HTMLElement>("[data-index]")?.dataset.index ?? null);

test("Tab moves across the photo grid, not down a column", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/photos", { waitUntil: "networkidle" });
  const tiles = page.locator("[data-index] .tile");
  const count = await tiles.count();
  expect(count).toBeGreaterThan(3);

  await page.locator('[data-index="0"] .tile').focus();
  await page.keyboard.press("Tab");
  expect(await focusedIndex(page)).toBe("1");
  await page.keyboard.press("Tab");
  expect(await focusedIndex(page)).toBe("2");
  await page.keyboard.press("Shift+Tab");
  expect(await focusedIndex(page)).toBe("1");

  // From the last photo, Tab leaves the gallery.
  await page.locator(`[data-index="${count - 1}"] .tile`).focus();
  await page.keyboard.press("Tab");
  expect(await focusedIndex(page)).toBeNull();
});
