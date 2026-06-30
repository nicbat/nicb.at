<script lang="ts">
  import { theme } from "$lib/stores/theme";
  import { page } from "$app/stores";
  import "../lib/styles/layout.css";
  import Navbar from "../lib/components/Navbar.svelte";
  import Footer from "../lib/components/Footer.svelte";
  import type { Snippet } from "svelte";

  let { children }: { children: Snippet } = $props();

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
  <Navbar />
  <div
    class="flex-1 mx-auto w-full px-5 flex flex-col"
    class:max-w-3xl={!$page.url.pathname.startsWith("/photos") &&
      !$page.url.pathname.startsWith("/travel") &&
      !$page.url.pathname.startsWith("/projects")}
  >
    <main class="flex-1 min-h-0 py-5">
      {@render children()}
    </main>
  </div>
  <Footer />
</div>
