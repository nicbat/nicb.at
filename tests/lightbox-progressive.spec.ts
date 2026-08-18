import { test, expect } from "@playwright/test";

// The lightbox must never wait on the original before showing something: the compressed
// derivative is already in cache from the grid tile, so it paints in the same frame as the click
// and the original fades in over it afterwards.
test("lightbox shows the derivative first, then swaps in the original", async ({ page }) => {
  // Hold the originals (/media/<file>, not /media/derived/...) so the "still loading" state is
  // observable rather than a race we'd usually lose.
  let release: (() => void) | null = null;
  const held = new Promise<void>((r) => (release = r));
  await page.route(/\/media\/(?!derived\/)[^/]+$/, async (route) => {
    await held;
    await route.continue();
  });

  await page.goto("/photos");
  const tile = page.locator(".gallery-item").first();
  await expect(tile).toBeVisible();
  const thumbSrc = await tile.locator("img").getAttribute("src");
  expect(thumbSrc).toContain("/media/derived/web/");

  await tile.click();

  // Placeholder layer: the derivative, visible immediately.
  const lightbox = page.locator(".fixed.inset-0");
  const placeholder = lightbox.locator("img").first();
  const original = lightbox.locator("img[aria-hidden='true']");
  await expect(placeholder).toHaveAttribute("src", thumbSrc!);
  await expect(placeholder).toBeVisible();

  // The original is mounted but transparent while its bytes are still in flight.
  await expect(original).toHaveClass(/opacity-0/);
  const originalSrc = await original.getAttribute("src");
  expect(originalSrc).not.toContain("/derived/");

  release!();

  // Once it loads it fades in on top, at the same box as the placeholder.
  await expect(original).not.toHaveClass(/opacity-0/);
  const a = await placeholder.boundingBox();
  const b = await original.boundingBox();
  expect(Math.round(b!.width)).toBe(Math.round(a!.width));
  expect(Math.round(b!.height)).toBe(Math.round(a!.height));
});

// One instance is reused for every photo, so opening a second image must fall back to *its*
// derivative rather than leaving the previous original on screen.
test("reopening a different photo resets to that photo's derivative", async ({ page }) => {
  await page.goto("/photos");
  const tiles = page.locator(".gallery-item");
  await expect(tiles.first()).toBeVisible();

  await tiles.nth(0).click();
  const lightbox = page.locator(".fixed.inset-0");
  await expect(lightbox.locator("img[aria-hidden='true']")).toBeVisible();
  await lightbox.click({ position: { x: 5, y: 5 } });

  const secondThumb = await tiles.nth(1).locator("img").getAttribute("src");
  await tiles.nth(1).click();
  await expect(lightbox.locator("img").first()).toHaveAttribute("src", secondThumb!);
});
