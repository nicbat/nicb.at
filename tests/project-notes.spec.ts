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
  // Every part's box, as a fraction of the note's width (rotation set aside).
  const layout = (note: string) =>
    page.locator(note).evaluate(el => {
      const n = el as HTMLElement;
      const w = n.offsetWidth;
      return [".title", ".desc", ".foot", ".links"].map(sel => {
        const part = n.querySelector<HTMLElement>(sel);
        return part ? [part.offsetLeft / w, part.offsetTop / w, part.offsetWidth / w, part.offsetHeight / w] : null;
      });
    });
  for (const project of projects.filter(p => p.urls?.length).slice(0, 4)) {
    const button = page.getByRole("button", { name: project.name, exact: true });
    const onPage = await layout(`.note-grid button.note[aria-label="${project.name}"]`);
    await button.click();
    const dialog = page.getByRole("dialog", { name: project.name });
    await expect(dialog).toBeVisible();
    const pickedUp = await layout(".viewer .note");
    onPage.forEach((box, i) =>
      box!.forEach((v, j) => expect(Math.abs(v - pickedUp[i]![j])).toBeLessThan(0.01)),
    );
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
