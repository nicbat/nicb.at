import { test, expect } from "@playwright/test";

// The zoomed print shows the same `web` derivative the grid tile already loaded. The originals are
// the same resolution (the derivatives are full-size re-encodes) but 4–9 MB, and many are Pixel
// Ultra HDR JPEGs: downloading and decoding one mid-animation made phones stutter and visibly
// brighten the photo as the HDR original faded in. So while the derivative is at least as large
// as the original, the viewer must never request the original at all.
test("zoomed photos reuse the derivative and never download originals", async ({ page }) => {
  // Only photos that have a derivative count: one without (media-manager skips a re-encode that
  // comes out larger) is shown from its original everywhere, grid included.
  const images: { src: string; thumb: unknown }[] = await (await page.request.get("/api/images")).json();
  const replaceable = new Set(images.filter((i) => i.thumb).map((i) => i.src));
  const originals: string[] = [];
  page.on("request", (req) => {
    const path = decodeURIComponent(new URL(req.url()).pathname);
    if (replaceable.has(path)) originals.push(path);
  });

  await page.goto("/photos");
  const tile = page.locator(".gallery-item").first();
  const thumbSrc = await tile.locator("img").getAttribute("src");
  expect(thumbSrc).toContain("/media/derived/web/");

  const dialog = page.getByRole("dialog");
  // Retry: a click that lands before hydration hits the server-rendered button with no handler.
  await expect(async () => {
    await tile.click();
    await expect(dialog).toBeVisible({ timeout: 1000 });
  }).toPass();

  // The zoomed print paints the very same, already-cached file.
  await expect(dialog.locator(".front img")).toHaveAttribute("src", thumbSrc!);

  // Flip, browse a few photos, close: still no originals.
  await dialog.getByRole("button", { name: "Flip over to read the back" }).click();
  for (let i = 0; i < 3; i++) await page.keyboard.press("ArrowRight");
  await expect(dialog.locator(".front img")).not.toHaveAttribute("src", thumbSrc!);
  await page.keyboard.press("Escape");
  await expect(dialog).toHaveCount(0);

  expect(originals).toEqual([]);
});

// Showing photos at normal brightness: HDR originals elsewhere on the site mustn't push the
// screen into HDR mode either.
test("photos are limited to standard dynamic range", async ({ page }) => {
  await page.goto("/photos");
  const limit = await page
    .locator(".gallery-item img")
    .first()
    .evaluate((img) => getComputedStyle(img).getPropertyValue("dynamic-range-limit"));
  expect(limit).toBe("standard");
});
