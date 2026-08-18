import { expect, test } from "@playwright/test";

// Trip photos carry a `name` in the media-manager `travel` class. It must survive the trip →
// gallery hop as both the img alt and the hover / lightbox caption.
test("trip photo names show as captions", async ({ page }) => {
  const trips = await (await page.request.get("/api/trips")).json();
  expect(trips.length).toBeGreaterThan(0);

  const named = (
    await Promise.all(
      trips.map(async (t: { slug: string }) => {
        const trip = await (await page.request.get(`/api/trips/${t.slug}`)).json();
        return trip.photos
          .filter((p: { caption?: string }) => p.caption)
          .map((p: { caption: string }) => ({ slug: t.slug, caption: p.caption }));
      }),
    )
  ).flat();
  expect(named.length).toBeGreaterThan(0);

  const { slug, caption } = named[0];
  await page.goto(`/travel/${slug}`);

  const item = page.locator(`img[alt="${caption}"]`).first().locator("xpath=ancestor::button[1]");
  await expect(item).toBeVisible();

  await item.hover();
  await expect(item.getByText(caption, { exact: true })).toBeVisible();

  await item.click();
  await expect(page.getByText(caption, { exact: true }).last()).toBeVisible();
});
