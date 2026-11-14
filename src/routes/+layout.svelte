<script lang="ts">
  import { theme } from "$lib/stores/theme";
  import { page } from "$app/stores";
  import "../lib/styles/layout.css";
  // Layout for media-manager Posts: `mm-*` content islands + rendered code blocks / copy buttons.
  import "media-manager/reader/posts.css";
  import Footer from "../lib/components/Footer.svelte";
  import Terminal from "$lib/components/Terminal.svelte";
  import type { Snippet } from "svelte";
  import type { LayoutData } from "./$types";

  let { children, data }: { children: Snippet; data: LayoutData } = $props();

  function getTitle(pathname: string) {
    if (pathname === "/" || pathname === "") return "Nicholas!";
    const segment = pathname.substring(1).split("/")[0];
    if (!segment) return "Nicholas!";
    const capitalized = segment.charAt(0).toUpperCase() + segment.slice(1);
    return `Nicholas • ${capitalized}`;
  }

  // Every page sits in the same frame (terminal + a 56rem column, see .site-row), so the terminal and
  // the content's left edge never move between pages. Home, projects and photos fill the column;
  // reading pages keep a narrower measure, left-aligned in it.
  function contentWidth(pathname: string) {
    if (
      pathname === "/" ||
      pathname.startsWith("/projects") ||
      pathname.startsWith("/photos") ||
      pathname.startsWith("/travel")
    )
      return "56rem";
    return "48rem";
  }

  $effect(() => {
    const savedTheme =
      (localStorage.getItem("theme") as "light" | "dark") || "light";
    theme.set(savedTheme);
    document.body.setAttribute("data-theme", savedTheme);
  });

  $effect(() => {
    const unsubscribe = theme.subscribe((value: string) => {
      if (typeof document !== "undefined") {
        document.body.setAttribute("data-theme", value);
      }
    });

    return unsubscribe;
  });
</script>

<svelte:head>
  <title>{getTitle($page.url.pathname)}</title>
</svelte:head>

<!-- The terminal comes first in Tab order; this lets keyboard users jump past it. -->
<a class="skip-link" href="#content">Skip to content</a>

<div class="site min-h-screen flex flex-col bg-main text-primary-text font-sans">
  <!-- Desktop: the terminal and the page's content column, centred together as one block, so
       nothing reads as shifted. Phones: just the content; the terminal is a bar fixed to the bottom. -->
  <div
    class="site-row flex-1"
    style:--content-w={contentWidth($page.url.pathname)}
  >
    <div class="term-col">
      <Terminal tree={data.tree} />
    </div>
    <div class="content flex flex-col">
      <main id="content" tabindex="-1" class="flex-1 min-h-0 py-10 sm:py-12 outline-none">
        {@render children()}
      </main>
    </div>
  </div>
  <Footer />
</div>

<style>
  .skip-link {
    position: fixed;
    top: 0.75rem;
    left: 0.75rem;
    z-index: 60;
    padding: 0.5rem 0.875rem;
    border-radius: 6px;
    background: var(--color-bg-surface);
    border: 1px solid var(--color-primary);
    color: var(--color-text-primary);
    font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
    font-size: 14px;
    transform: translateY(-200%);
  }
  .skip-link:focus {
    transform: none;
  }

  .content {
    width: 100%;
    min-width: 0;
    max-width: var(--content-w);
    margin-inline: auto;
    padding-inline: 1.25rem;
  }
  .term-col {
    display: contents;
  }

  @media (min-width: 1024px) {
    .site-row {
      display: grid;
      /* A fixed frame for every page, centred: the column is always 56rem wide. */
      grid-template-columns: 16rem minmax(0, 56rem);
      column-gap: 3rem;
      justify-content: center;
      padding-inline: 1.5rem;
    }
    .content {
      max-width: var(--content-w);
      margin: 0;
      padding: 0;
    }
    /* Starts level with the page's first line and stays in view as you scroll, never taller than
       the window (it scrolls inside itself instead). It stops at the footer with its column. */
    .term-col {
      display: block;
      /* Level with the top of every page's title (main's py-12). */
      padding-block: 3rem;
    }
    .term-col :global(.term) {
      position: sticky;
      top: 1.5rem;
      max-height: calc(100vh - 3rem);
    }
  }

  /* Room under the footer for the terminal bar pinned to the bottom of the screen. */
  @media (max-width: 1023.98px) {
    .site {
      padding-bottom: 4.5rem;
    }
  }
</style>
