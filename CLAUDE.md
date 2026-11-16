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

**Open item, photo sizes:** every photo on the site is served from media-manager's `web` preset, which is a full-resolution re-encode (12–24 MP), so phones decode far more pixels than they show. The plan is a resized media-manager preset; see the `TODO(photos perf)` above `THUMB_PRESET` in `src/lib/index.ts`. Bring it up when working on photos or performance.

### Projects (sticky notes)

Each project renders as a sticky note (`StickyNote.svelte`). Everything inside a note is sized in `cqw` of its width and the picked-up note shows the same content, so picking one up scales it without rewrapping (as with the photo prints); keep it that way. The picked-up copy is laid out at the page note's width and enlarged with a transform, not laid out big: text set at a different font size spaces its letters differently, which showed as the letters shifting on pick-up. Its color comes from its tags, and its tilt and pile position are seeded from the record id (`src/lib/stickyNote.ts`). The home page shows the `featured` notes and links to /projects, which shows them all. Clicking a note picks it up in `NoteViewer.svelte` (a GSAP flight, like PhotoViewer). An optional `image` file field on a project record shows a photo taped onto its note. A pile → grid transition between the two pages was built and shelved because it felt choppy; `docs/project-notes-transition.md` has the code and what to fix if it comes back.

### Site terminal (navigation)

There is no navbar and there are no per-page "Back to home" links: navigation is the site terminal (`src/lib/components/Terminal.svelte`, mounted in `+layout.svelte`). Its title bar is the breadcrumb for the current URL (`nicbat/words/matcha`, every segment a link); below it is a `$` prompt with tab completion. On desktop (≥1024px) it sits in the layout's left column, sticky on every page; below that it's a bar fixed to the bottom of the screen showing only the breadcrumbs, with an arrow that expands it, and it lifts above the on-screen keyboard (`visualViewport`). `/` anywhere focuses the prompt.

- It's one running session: output is appended to a log that persists across pages and reloads (`sessionStorage`, per tab), ↑/↓ recall earlier commands, the same command run back to back collapses to one line (`$ quote x3`), and `..` / `../x` / `~` on their own work as `cd`.
- Layout: every page sits in one centred frame, the terminal (16rem) + a 56rem content column, so nothing moves between pages. Home, projects and photos fill the column; reading pages use 48rem, left-aligned (`contentWidth` in `+layout.svelte`). Every page opens with the default `<h1>` then a `<p class="page-lede">` (fixed gap to the content), and the terminal lines up with that h1; a test checks it.
- The shell (`src/lib/terminal/shell.ts`) is pure: the site as a folder tree, path resolution, completion, and `run()`, which returns output lines and/or an action (navigate, scroll to heading, theme, ...) for the component to carry out. Commands: `cd` (incl. `..`, `-`, `#heading`), `ls`, `tree`, `help`, `clear`, `back`/`forward` (the browser's), `theme`, `top`, `bottom`, `up`/`down` (half a screen), `quote`, `contact`, `open <link>`, `copy <link>`; plus shortcuts: `home` and each top-level section name (`photos`, `projects`, ...) go there, and each contact name (`github`, `email`, ...) opens it. Contacts come from `src/lib/contacts.ts`.
- Fixed sections (photos, projects, words, now) are listed in `buildTree`; posts come from `/api/tree` (`fetchSiteTree`), loaded once in `+layout.ts`. A new top-level page needs adding to `buildTree`.
- **Travel is hidden** (`TRAVEL_ENABLED = false` in `src/lib/features.ts`): `/travel`, every trip page (via `src/routes/travel/+layout.ts`) and `/api/trips` 404, and it's out of the terminal. The code is all still there; flip the flag and re-add `travel` to `buildTree` to bring it back.
- Pages talk to it through `src/lib/terminal/state.svelte.ts`: a post calls `trackHeadings(data.headings)` (the heading list + which one is being read), and home sets `terminal.shuffleQuote` for the `quote` command.
- Post headings get ids in `fetchPost` (`withHeadingIds` in `src/lib/index.ts`); the reader's markdown-it renders them without.
- Below the viewers: it's z-index 40, NoteViewer/PhotoViewer are 50, so a picked-up note or photo dims it with the page.

**Open item, path follows the viewer:** picking up a sticky note or opening a photo should put it in the URL and the terminal's path (`nicbat/projects/echo-armor`, `nicbat/photos/<slug>`), so it can be shared, the browser back button puts it back, and `cd projects/echo-armor` / `cd ..` / `prev` / `next` work from the prompt. Agreed plan: SvelteKit shallow routing (`pushState` + `page.state`) when a viewer opens, plus real `/projects/[slug]` and `/photos/[slug]` routes for direct visits; slugs from a new `html_route` field on projects and photos in the media manager, falling back to `slugify(name)` for projects and the filename stem for photos (the same pattern as `tripSlug`). While a viewer is open the terminal stays dimmed under its backdrop (decided: don't lift it above). Bring it up when working on projects, photos or the terminal.

**Open item, older / newer post links:** a quiet "← older · newer →" at the end of a post; deferred by the owner, see the `TODO(words, bring up later)` in `src/routes/words/[slug]/+page.svelte`. Bring it up when working on posts.

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
