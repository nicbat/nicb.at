import { expect, test } from "@playwright/test";
import projectData from "../src/assets/media_manager/records/projects/data.json" with { type: "json" };

const projects = projectData.records;
const featured = projects.filter(p => p.featured);

test("a note picks up with working links, and sticks back", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", error => errors.push(error.message));
  await page.goto("/projects");
  const project = projects.find(p => p.urls?.length && p.description)!;
  const note = page.getByRole("button", { name: project.name, exact: true });
  await note.click();

  const dialog = page.getByRole("dialog", { name: project.name });
  await expect(dialog).toBeVisible();
  for (const url of project.urls) {
    await expect(dialog.getByRole("link", { name: `${url.display_name.toLowerCase()} →` })).toHaveAttribute("href", url.url);
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

test("a picked-up note is the same note scaled up: nothing rewraps or moves", async ({ page }) => {
  await page.goto("/projects");
  // The note's width and every part's box, in layout px (transforms set aside). The picked-up copy
  // is laid out at the page note's width and enlarged with a transform, so these match exactly:
  // text set at another font size would space its letters differently.
  const layout = (note: string) =>
    page.locator(note).evaluate(el => {
      const n = el as HTMLElement;
      return [n.offsetWidth, ...[".title", ".desc", ".foot", ".links"].flatMap(sel => {
        const part = n.querySelector<HTMLElement>(sel);
        return part ? [part.offsetLeft, part.offsetTop, part.offsetWidth, part.offsetHeight] : [];
      })];
    });
  for (const project of projects.filter(p => p.urls?.length).slice(0, 4)) {
    const button = page.getByRole("button", { name: project.name, exact: true });
    const onPage = await layout(`.note-grid button.note[aria-label="${project.name}"]`);
    await button.click();
    const dialog = page.getByRole("dialog", { name: project.name });
    await expect(dialog).toBeVisible();
    expect(await layout(".viewer .note")).toEqual(onPage);
    // ...and once it lands it shows at its picked-up size, min(26rem, 100vw - 2rem).
    const viewport = page.viewportSize()!;
    await expect
      .poll(() => page.locator(".viewer .card").evaluate(el => el.getBoundingClientRect().height))
      .toBeGreaterThan(Math.min(416, viewport.width - 32) * 0.98);
    await page.keyboard.press("Escape");
    await expect(dialog).toHaveCount(0);
  }
});

test("project notes fit a phone", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/projects");
  await expect(page.locator(".note-grid button.note").first()).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
  await page.goto("/");
  const section = page.getByRole("region", { name: "Projects", exact: true });
  await section.scrollIntoViewIfNeeded();
  await expect(section.getByRole("button", { name: featured[0].name, exact: true })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
});
