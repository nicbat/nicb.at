import { expect, test } from "@playwright/test";

// Gallery tiles are polaroids: tapping one zooms it into a card, tapping the card flips it over to
// the media-manager `description` (or a placeholder when it's blank), and Escape puts it back.
test("photo card zooms in, flips to its description, and closes", async ({ page }) => {
  // Descriptions are still sparse; trip photos are where they exist today.
  type Photo = { alt: string; description?: string };
  const trips = await (await page.request.get("/api/trips")).json();
  let found: { slug: string; photo: Photo } | undefined;
  for (const t of trips as { slug: string }[]) {
    const trip = await (await page.request.get(`/api/trips/${t.slug}`)).json();
    const photo = (trip.photos as Photo[]).find((p) => p.description);
    if (photo) {
      found = { slug: t.slug, photo };
      break;
    }
  }
  expect(found, "at least one trip photo has a description").toBeTruthy();
  const described = found!.photo;

  await page.goto(`/travel/${found!.slug}`);
  const tile = page.locator(`.gallery-item:has(img[alt="${described.alt}"])`).first();
  const dialog = page.getByRole("dialog");
  // Retry: a click that lands before hydration hits the server-rendered button with no handler.
  await expect(async () => {
    await tile.click();
    await expect(dialog).toBeVisible({ timeout: 1000 });
  }).toPass();
  const card = dialog.getByRole("button", { name: "Flip over to read the back" });
  await expect(card).toHaveAttribute("aria-pressed", "false");

  await card.click();
  await expect(dialog.getByRole("button", { name: "Flip back to the photo" })).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  await expect(dialog.locator(".back-note")).toHaveText(described.description!.trim());

  await page.keyboard.press("Escape");
  await expect(dialog).toHaveCount(0);
  // The tile was hidden while "picked up"; it must be back on the table afterwards.
  await expect(tile).toBeVisible();
});

test("a photo without a description shows the empty note", async ({ page }) => {
  const images = await (await page.request.get("/api/images")).json();
  const bare = images.find((i: { description?: string }) => !i.description);

  await page.goto("/photos");
  await page.locator(`.gallery-item:has(img[alt="${bare.alt}"])`).first().click();
  await page.getByRole("button", { name: "Flip over to read the back" }).click();
  await expect(page.getByText("No note on the back of this one yet.")).toBeVisible();
});

test("prev / next and the arrow keys browse without closing, and close returns that photo", async ({ page }) => {
  const images = await (await page.request.get("/api/images")).json();
  await page.goto("/photos");
  const dialog = page.getByRole("dialog");
  const first = page.locator(`.gallery-item:has(img[alt="${images[0].alt}"])`);
  await expect(async () => {
    await first.click();
    await expect(dialog).toBeVisible({ timeout: 1000 });
  }).toPass();
  await expect(dialog).toHaveAttribute("aria-label", images[0].title ?? images[0].alt);

  await dialog.getByRole("button", { name: "Next photo" }).click();
  await expect(dialog).toHaveAttribute("aria-label", images[1].title ?? images[1].alt);
  await page.keyboard.press("ArrowRight");
  await expect(dialog).toHaveAttribute("aria-label", images[2].title ?? images[2].alt);
  await page.keyboard.press("ArrowLeft");
  await expect(dialog).toHaveAttribute("aria-label", images[1].title ?? images[1].alt);
  // Wrapping backwards from the first photo lands on the last.
  await dialog.getByRole("button", { name: "Previous photo" }).click();
  await dialog.getByRole("button", { name: "Previous photo" }).click();
  const last = images[images.length - 1];
  await expect(dialog).toHaveAttribute("aria-label", last.title ?? last.alt);

  await page.keyboard.press("Escape");
  await expect(dialog).toHaveCount(0);
  // Every tile is back on the table, including the one that was "out" when we closed.
  await expect(page.locator('.gallery-item[style*="visibility: hidden"]')).toHaveCount(0);
});

test("zoomed print matches its tile's proportions", async ({ page }) => {
  await page.goto("/photos");
  const tile = page.locator(".gallery-item").first();
  const ratio = (el: Element) => (el as HTMLElement).offsetHeight / (el as HTMLElement).offsetWidth;
  const tileRatio = await tile.locator(".print").evaluate(ratio);
  const dialog = page.getByRole("dialog");
  await expect(async () => {
    await tile.click();
    await expect(dialog).toBeVisible({ timeout: 1000 });
  }).toPass();
  const cardRatio = await dialog.locator(".card").evaluate(ratio);
  // Same print at two scales: a mismatch here is the "jump" when the card lands back in the grid.
  expect(Math.abs(cardRatio - tileRatio)).toBeLessThan(0.01);
});

test("home profile photo is a print that zooms and flips", async ({ page }) => {
  await page.goto("/");
  const print = page.locator(".home-hero .polaroid .tile");
  const dialog = page.getByRole("dialog");
  await expect(async () => {
    await print.click();
    await expect(dialog).toBeVisible({ timeout: 1000 });
  }).toPass();
  // A single photo: nothing to browse.
  await expect(dialog.getByRole("button", { name: "Next photo" })).toHaveCount(0);
  await dialog.getByRole("button", { name: "Flip over to read the back" }).click();
  await expect(dialog.getByRole("heading", { name: "Me", exact: true })).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(dialog).toHaveCount(0);
  await expect(print).toBeVisible();
});
