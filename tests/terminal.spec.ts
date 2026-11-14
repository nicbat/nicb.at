import { test, expect, devices } from "@playwright/test";

const terminal = (page: import("@playwright/test").Page) =>
  page.getByRole("region", { name: "Site terminal" });

test("breadcrumbs show the path and link back up", async ({ page }) => {
  await page.goto("/words/matcha");
  const crumbs = terminal(page).getByRole("navigation", { name: "Breadcrumb" });
  await expect(crumbs).toHaveText(/nicbat\/\s*words\/\s*matcha/);
  await crumbs.getByRole("link", { name: "words" }).click();
  await expect(page).toHaveURL(/\/words$/);
  await expect(page.getByRole("heading", { level: 1, name: "Words" })).toBeVisible();
});

test("a post's headings are listed and linkable", async ({ page }) => {
  await page.goto("/words/matcha");
  const heads = terminal(page).getByRole("navigation", { name: "On this page" });
  await expect(heads.getByRole("link", { name: "Coconut Matcha" })).toHaveAttribute(
    "href",
    "#coconut-matcha",
  );
  await expect(page.locator("h3#coconut-matcha")).toHaveCount(1);
});

test("typing with tab completion navigates", async ({ page }) => {
  // Wait for hydration, or the "/" shortcut has no listener yet.
  await page.goto("/words/matcha", { waitUntil: "networkidle" });
  await page.keyboard.press("/");
  await page.keyboard.type("cd ../la");
  await page.keyboard.press("Tab");
  await expect(page.getByLabel("Command")).toHaveValue("cd ../lazy-loading");
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/\/words\/lazy-loading$/);
  await expect(page.getByRole("heading", { level: 1, name: "Lazy Loading" })).toBeVisible();
});

test("ls lists a section and its entries are links", async ({ page }) => {
  await page.goto("/");
  await page.getByLabel("Command").fill("ls");
  await page.getByLabel("Command").press("Enter");
  const log = terminal(page).getByRole("log");
  await log.getByRole("link", { name: "words/" }).click();
  await expect(page).toHaveURL(/\/words$/);
  // Travel is hidden, so it isn't listed.
  await page.getByLabel("Command").fill("ls /");
  await page.getByLabel("Command").press("Enter");
  await expect(log.getByRole("link", { name: /travel/ })).toHaveCount(0);
});

test("a typo suggests the nearest page", async ({ page }) => {
  await page.goto("/words");
  await page.getByLabel("Command").fill("cd macha");
  await page.getByLabel("Command").press("Enter");
  const log = terminal(page).getByRole("log");
  await expect(log).toContainText("No such file or directory");
  await expect(log.getByRole("link", { name: "words/matcha" })).toBeVisible();
});

test("theme command switches to dark mode", async ({ page }) => {
  await page.goto("/");
  await page.getByLabel("Command").fill("theme dark");
  await page.getByLabel("Command").press("Enter");
  await expect(page.locator("html")).toHaveClass(/dark/);
});

test("theme toggles and light/dark shortcuts select a mode directly", async ({ page }) => {
  await page.goto("/", { waitUntil: "networkidle" });
  const command = page.getByLabel("Command");
  const root = page.locator("html");
  for (const [input, dark] of [
    ["light", false], ["theme", true], ["theme", false],
    ["dark", true], ["dark", true], ["light", false], ["light", false],
  ] as const) {
    await command.fill(input);
    await command.press("Enter");
    if (dark) await expect(root).toHaveClass(/dark/);
    else await expect(root).not.toHaveClass(/dark/);
  }
  for (const [prefix, full] of [["dar", "dark"], ["lig", "light"]]) {
    await command.fill(prefix);
    await command.press("Tab");
    await expect(command).toHaveValue(full);
  }
  await command.fill("dark");
  await command.press("Enter");
  await page.reload();
  await expect(root).toHaveClass(/dark/);
});

test.describe("phone", () => {
  // iPhone-sized viewport and touch, on the suite's Chromium (the device preset defaults to WebKit).
  const { defaultBrowserType: _webkit, ...iphone } = devices["iPhone 13"];
  test.use(iphone);

  test("the bar shows breadcrumbs and expands to the prompt", async ({ page }) => {
    await page.goto("/words/matcha");
    await expect(terminal(page).getByRole("navigation", { name: "Breadcrumb" })).toHaveText(
      /nicbat\/\s*words\/\s*matcha/,
    );
    await expect(page.getByLabel("Command")).toBeHidden();
    await page.getByRole("button", { name: "Open terminal" }).click();
    await expect(page.getByLabel("Command")).toBeVisible();
    await expect(
      terminal(page).getByRole("navigation", { name: "On this page" }),
    ).toBeVisible();
  });
});

test("a post shows reading progress that grows as you scroll", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 700 });
  await page.goto("/words/matcha", { waitUntil: "networkidle" });
  const fill = terminal(page).locator(".progress-fill");
  const scale = async () =>
    Number((await fill.evaluate((el) => el.style.transform)).match(/scaleX\(([\d.]+)\)/)?.[1]);
  expect(await scale()).toBeLessThan(0.1);
  await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
  await expect.poll(scale).toBeGreaterThan(0.95);
  // Not on other pages.
  await page.goto("/words");
  await expect(terminal(page).locator(".progress")).toHaveCount(0);
});

test("the first Tab offers a skip past the terminal", async ({ page }) => {
  await page.goto("/words/matcha", { waitUntil: "networkidle" });
  await page.keyboard.press("Tab");
  const skip = page.getByRole("link", { name: "Skip to content" });
  await expect(skip).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.locator("main#content")).toBeFocused();
});

test("subheadings appear in the terminal once you reach their section", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto("/words/matcha", { waitUntil: "networkidle" });
  const heads = terminal(page).getByRole("navigation", { name: "On this page" });
  await expect(heads.getByRole("link", { name: "Ingredients" })).toHaveCount(0);
  await page.locator("#ingredients").scrollIntoViewIfNeeded();
  await page.evaluate(() => window.scrollBy(0, 200));
  await expect(heads.getByRole("link", { name: "Ingredients" })).toBeVisible();
  await expect(heads.getByRole("link", { name: "Steps" })).toBeVisible();
});

test("a post shows its date under the title", async ({ page }) => {
  await page.goto("/words/matcha");
  await expect(page.locator("article time").first()).toHaveText("November 6, 2026");
});

test("the session carries on across pages and reloads, and ↑ recalls commands", async ({ page }) => {
  await page.goto("/", { waitUntil: "networkidle" });
  const prompt = page.getByLabel("Command");
  const log = terminal(page).getByRole("log");
  await prompt.fill("ls");
  await prompt.press("Enter");
  await prompt.fill("cd words");
  await prompt.press("Enter");
  await expect(page).toHaveURL(/\/words$/);
  // The earlier output is still there, plus the cd itself, and the prompt kept focus.
  await expect(log).toContainText("$ ls");
  await expect(log).toContainText("$ cd words");
  await expect(prompt).toBeFocused();
  await prompt.press("ArrowUp");
  await expect(prompt).toHaveValue("cd words");
  await prompt.press("ArrowUp");
  await expect(prompt).toHaveValue("ls");
  await page.reload({ waitUntil: "networkidle" });
  await expect(terminal(page).getByRole("log")).toContainText("$ cd words");
});

test("every page starts at the same height, level with the terminal", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  const tops: Record<string, [number, number]> = {};
  for (const path of ["/", "/photos", "/projects", "/words", "/words/matcha", "/now"]) {
    await page.goto(path);
    tops[path] = await page.evaluate(() => [
      Math.round(document.querySelector("main h1")!.getBoundingClientRect().top + scrollY),
      Math.round(document.querySelector(".term")!.getBoundingClientRect().top + scrollY),
    ]);
  }
  const [h1, term] = tops["/words"];
  expect(h1).toBe(term);
  for (const [path, [h, t]] of Object.entries(tops)) {
    expect.soft(h, `${path} title`).toBe(h1);
    expect.soft(t, `${path} terminal`).toBe(term);
  }
});

test(".. on its own goes up a level", async ({ page }) => {
  await page.goto("/words/matcha", { waitUntil: "networkidle" });
  await page.getByLabel("Command").fill("..");
  await page.getByLabel("Command").press("Enter");
  await expect(page).toHaveURL(/\/words$/);
  await page.getByLabel("Command").fill("../photos");
  await page.getByLabel("Command").press("Enter");
  await expect(page).toHaveURL(/\/photos$/);
});

test("home and section names are commands", async ({ page }) => {
  await page.goto("/words/matcha", { waitUntil: "networkidle" });
  const prompt = page.getByLabel("Command");
  await prompt.fill("photos");
  await prompt.press("Enter");
  await expect(page).toHaveURL(/\/photos$/);
  await prompt.fill("home");
  await prompt.press("Enter");
  await expect(page).toHaveURL(/\/$/);
});

test("copy puts a social link on the clipboard, and its name opens it", async ({ page, context }) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.goto("/", { waitUntil: "networkidle" });
  const prompt = page.getByLabel("Command");
  await prompt.fill("copy github");
  await prompt.press("Enter");
  await expect(terminal(page).getByRole("log")).toContainText("copied github");
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe("https://github.com/nicbat");

  // Don't actually leave for GitHub: just check a new tab is asked for with the right URL.
  await context.route("https://github.com/**", (route) => route.fulfill({ body: "ok" }));
  const popup = page.waitForEvent("popup");
  await prompt.fill("github");
  await prompt.press("Enter");
  await (await popup).waitForURL("https://github.com/nicbat");
});

test("running a command again straight after counts it instead of repeating it", async ({ page }) => {
  await page.goto("/", { waitUntil: "networkidle" });
  const prompt = page.getByLabel("Command");
  for (let i = 0; i < 3; i++) {
    await prompt.fill("quote");
    await prompt.press("Enter");
  }
  const log = terminal(page).getByRole("log");
  await expect(log.locator(".line")).toHaveCount(1);
  await expect(log).toHaveText("$ quote x3");
  await prompt.fill("top");
  await prompt.press("Enter");
  await prompt.fill("quote");
  await prompt.press("Enter");
  await expect(log.locator(".line")).toHaveCount(3);
});

test("bottom, up and down scroll the page", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 700 });
  await page.goto("/words/matcha", { waitUntil: "networkidle" });
  const prompt = page.getByLabel("Command");
  const y = () => page.evaluate(() => Math.round(scrollY));
  await prompt.fill("down");
  await prompt.press("Enter");
  await expect.poll(y).toBe(350);
  await prompt.fill("bottom");
  await prompt.press("Enter");
  const max = await page.evaluate(() => document.documentElement.scrollHeight - innerHeight);
  await expect.poll(y).toBe(max);
  await prompt.fill("up");
  await prompt.press("Enter");
  await expect.poll(y).toBe(max - 350);
});

test("back and forward work like the browser buttons", async ({ page }) => {
  await page.goto("/words", { waitUntil: "networkidle" });
  const prompt = page.getByLabel("Command");
  await prompt.fill("cd matcha");
  await prompt.press("Enter");
  await expect(page).toHaveURL(/\/words\/matcha$/);
  await prompt.fill("back");
  await prompt.press("Enter");
  await expect(page).toHaveURL(/\/words$/);
  await prompt.fill("forward");
  await prompt.press("Enter");
  await expect(page).toHaveURL(/\/words\/matcha$/);
});
