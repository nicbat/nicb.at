<script lang="ts">
  import { theme } from "$lib/stores/theme";
  import { page } from "$app/stores";
  import "../lib/styles/layout.css";
  // Layout for media-manager Posts: `mm-*` content islands + rendered code blocks / copy buttons.
  import "media-manager/reader/posts.css";
  import Footer from "../lib/components/Footer.svelte";
  import type { Snippet } from "svelte";
  import { browser } from "$app/environment";
  import { afterNavigate, beforeNavigate } from "$app/navigation";
  import { gsap } from "gsap";
  import { Flip } from "gsap/Flip";

  let { children }: { children: Snippet } = $props();

  // Project notes fly between pages: going from the home page's featured notes and pile to the
  // /projects grid (and back), each note is captured before the navigation and animated from there
  // once the new page is in. Flip pairs old and new notes by their `data-flip-id`, even though they
  // are different elements on different pages. Any other navigation is left alone.
  if (browser) gsap.registerPlugin(Flip);
  const NOTE_PAGES = new Set(["/", "/projects"]);
  const NOTES = '[data-flip-id^="note-"]';
  let noteState: Flip.FlipState | null = null;

  beforeNavigate(({ from, to, willUnload }) => {
    noteState = null;
    if (willUnload || !from || !to) return;
    const a = from.url.pathname;
    const b = to.url.pathname;
    if (a === b || !NOTE_PAGES.has(a) || !NOTE_PAGES.has(b)) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (!document.querySelector(NOTES)) return;
    noteState = Flip.getState(NOTES);
  });

  afterNavigate(() => {
    if (!noteState) return;
    const state = noteState;
    noteState = null;
    const targets = gsap.utils.toArray<HTMLElement>(NOTES);
    // Only notes that were on screen before fly; the rest just appear.
    const inView = (el: HTMLElement) => {
      const r = el.getBoundingClientRect();
      return r.bottom > 0 && r.top < window.innerHeight;
    };
    Flip.from(state, {
      targets: targets.filter(inView),
      duration: 0.9,
      ease: "power3.inOut",
      absolute: true,
      scale: true,
      stagger: 0.04,
      zIndex: 40,
    });
  });

  function getTitle(pathname: string) {
    if (pathname === "/" || pathname === "") return "Nicholas!";
    const segment = pathname.substring(1).split("/")[0];
    if (!segment) return "Nicholas!";
    const capitalized = segment.charAt(0).toUpperCase() + segment.slice(1);
    return `Nicholas • ${capitalized}`;
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

<div class="min-h-screen flex flex-col bg-main text-primary-text font-sans">
  <div
    class="flex-1 mx-auto w-full px-5 flex flex-col"
    class:max-w-3xl={$page.url.pathname !== "/" &&
      !$page.url.pathname.startsWith("/photos") &&
      !$page.url.pathname.startsWith("/travel") &&
      !$page.url.pathname.startsWith("/projects")}
  >
    <main class="flex-1 min-h-0 py-10 sm:py-12">
      {@render children()}
    </main>
  </div>
  <Footer />
</div>
