# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Personal website (nicb.at) — a SvelteKit 5 + TypeScript site styled with Tailwind v4. Deployed to Vercel via `@sveltejs/adapter-vercel`; the repo is synced to Vercel, which builds it. (`gh-pages` / `adapter-static` config is left commented out in `svelte.config.js` as an alternative deploy path.)

## Commands

```bash
npm run dev        # local dev server (vite)
npm run build      # production build → ./build
npm run preview    # preview the production build
npm run check      # svelte-kit sync + svelte-check type checking
npm run deploy     # gh-pages deploy (alternative to Vercel; runs build first)
```

There is no test suite. `npm run check` is the closest thing to CI — run it to validate types after changes. Node engine is pinned (`engine-strict=true` in `.npmrc`).

## Svelte 5 (runes only)

This is a Svelte 5 project — write **runes**, never Svelte 3/4 syntax. `npm run check` will flag most of the legacy forms.

- State: `let x = $state(0)` — not implicitly-reactive `let`.
- Computed: `let y = $derived(expr)` / `$derived.by(() => …)` — not `$:` statements.
- Side effects: `$effect(() => …)` — not `$:` blocks. (`onMount` is still fine for run-once mount logic like a fetch.)
- Props: `let { data }: { data: PageData } = $props()` — not `export let`. Default values go in the destructure (`let { content = "" } = $props()`).
- Events: attribute handlers `onclick`/`onscroll`/`onchange` — not `on:click` directives. No event modifiers; do `e.preventDefault()` in the handler.
- Slots → snippets: a component's default content is `let { children } = $props()` rendered with `{@render children()}`; pass content with `{#snippet …}`. No `<slot>`, `$$props`, `$$restProps`, or `createEventDispatcher` (use callback props).
- `bind:this` targets and other reassigned-from-the-template vars should be `$state` (e.g. `let el = $state<HTMLElement>()`).
- Component instance methods are still `export function …`, called via a `bind:this` reference.

Path aliases (`$lib`, etc.), `.svelte.ts` stores, `writable`/`readable` stores with `$store` auto-subscription, and `import.meta.glob` are all unchanged and still correct.

## Architecture

### Content pipeline (the important part)

All site content lives in `src/assets/` and flows through a consistent pattern. There is **no database and no CMS server** — content is static files bundled at build time.

1. **Source of truth** is JSON under `src/assets/media_manager/<collection>/data.json` (projects, quotes, globals) and `image-data.json` (photos), plus markdown files in `src/assets/blog/*.md`. These JSON files are produced by an external "media manager" desktop tool, not edited by hand here — hence shapes like `records[]`, `__field_kinds`, and per-collection `settings.json`. The image binaries live in `src/assets/media_manager/files/`.

2. **`src/lib/index.ts`** is the data-access layer. It reads those assets with `import.meta.glob` / dynamic `import()` and transforms the raw media-manager records into the clean domain types in `src/lib/types.ts` (`Project`, `Quote`, `ImageData`). Photos are matched to their bundled binary by filename (case-insensitive extension) and `hidden` photos are filtered out here.

3. **`src/routes/api/*/+server.ts`** are thin GET endpoints that call the `src/lib/index.ts` functions and return `json(...)`. Sorting/filtering lives here (e.g. quotes are filtered to `show_on_homepage`, posts/projects sorted by date desc).

4. **`+page.ts` load functions** `fetch('/api/...')` and hand the data to the `+page.svelte` components.

When adding or changing content behavior, follow this chain: `src/assets` → transform in `src/lib/index.ts` → expose via `src/routes/api/.../+server.ts` → consume in the route's `+page.ts`.

### Blog posts (mdsvex)

Markdown posts (`src/assets/blog/*.md`) are compiled by **mdsvex** (configured in `svelte.config.js`) — `.md` is registered as a Svelte extension. Each post has YAML frontmatter (`title`, `date`, `description`); `date` is a `YYMMDD` string. Code blocks are syntax-highlighted at build time by **shiki** (theme `catppuccin-mocha`); only the languages listed in `svelte.config.js` (`javascript, typescript, python, c, bash`) are available — add new languages there. Individual posts render via the dynamic route `src/routes/words/[slug]/+page.ts`, which resolves the matching `.md` through `import.meta.glob`, pulls its `metadata` + default component, and returns `error(404)` for unknown slugs.

### Theming

Light/dark theme is set on `<html data-theme=...>` / `.dark` class and persisted to `localStorage`. To avoid a flash of unstyled theme, the same blocking script is injected in **two** places: inline in `src/app.html` and again via `transformPageChunk` in `src/hooks.server.ts` (importing `themeScript` from `src/lib/stores/theme.ts`). The runtime store lives in `src/lib/stores/theme.ts`. Color tokens are in `src/lib/styles/colors.css`.

### Path aliases (svelte.config.js)

- `$lib` → `src/lib`
- `$components` → `src/lib/components`
- `$assets` → `src/assets`

Note non-default build settings: `appDir: "app"` and `outDir: "build"`.

## Browser testing

Real-browser smoke tests run via **Playwright** (`@playwright/test`) against the Playwright-managed Chromium. Specs live in `tests/*.spec.ts`; `playwright.config.ts` is at repo root.

The config's `webServer` auto-runs `npm run build && npm run preview` on port 4173, waits for it, and sets `baseURL` there. `reuseExistingServer` is on locally, so an already-running preview is reused. Because tests hit the production build, after changing routes/content rebuild happens automatically — no need to start a server by hand.

```bash
npm run test:e2e                              # full suite (headless Chromium)
npx playwright test tests/smoke.spec.ts:26    # one test by file:line
npx playwright test -g "404"                   # filter by title
npx playwright test --headed                   # watch it run in a real window
npx playwright test --debug                    # step through with the inspector
npx playwright show-report                     # last HTML report
```

The browser binary is already installed (`npx playwright install chromium` if missing). A system `google-chrome-stable` also exists; to drive it instead set `channel: "chrome"` on the chromium project — but the bundled Chromium is the default and is what CI/this suite uses.

To verify a new feature in Chrome: add (or extend) a spec under `tests/`, assert on real DOM via role/text locators (`page.getByRole("heading", { name: ... })`), use `page.goto(path)` with paths relative to `baseURL`, and check `response.status()` for error pages. Run `npm run test:e2e` and iterate until green. The current `tests/smoke.spec.ts` covers `/`, `/words`, `/projects`, `/photos`, navigation into a post, and the `/words/<unknown>` 404 — mirror its style.
