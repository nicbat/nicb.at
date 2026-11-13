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
  await expect(page.getByText("Nothing written on the back of this one — yet.")).toBeVisible();
});
