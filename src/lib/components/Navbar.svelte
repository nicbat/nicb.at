<script lang="ts">
  import { Moon, Sun } from "lucide-svelte";
  import { theme } from "$lib/stores/theme";
  import { onMount } from "svelte";

  function toggleTheme(): void {
    theme.update((t) => (t === "light" ? "dark" : "light"));
  }

  let isHovered = $state(false);
  let scrollY = $state(0);

  function handleScroll() {
    scrollY = window.scrollY;
  }
</script>

<svelte:window on:scroll={handleScroll} />

<nav
  class="sticky top-0 z-50 bg-main transition-all duration-0 ease-in-out px-4 py-3 border-b border-transparent"
  class:border-primary={scrollY > 50}
  class:py-2={scrollY > 50}
>
  <div class="max-w-3xl mx-auto flex justify-between items-center">
    <div class="logo">
      <a
        href="/"
        class="text-xl font-bold text-primary-text hover:text-secondary-text no-underline"
      >
        nicbat
      </a>
    </div>
    <ul class="flex items-center space-x-6 text-sm">
      <li>
        <a
          href="/photos"
          class="text-secondary-text hover:text-primary-text transition-colors"
        >
          Photos
        </a>
      </li>
      <li>
        <a
          href="/projects"
          class="text-secondary-text hover:text-primary-text transition-colors"
        >
          Projects
        </a>
      </li>
      <li>
        <a
          href="/words"
          class="text-secondary-text hover:text-primary-text transition-colors"
        >
          Words
        </a>
      </li>

      <label
        class="relative inline-flex items-center cursor-pointer ml-4"
        aria-label="Toggle dark mode"
      >
        <input
          type="checkbox"
          class="sr-only peer"
          checked={$theme === "dark"}
          onchange={toggleTheme}
        />
        <div
          class="w-10 h-6 rounded-full border border-secondary-text/50 peer-focus:outline-none transition-colors"
        ></div>

        <div
          class="absolute left-1 top-1 w-4 h-4 bg-secondary-text rounded-full transition-transform duration-300 ease-in-out peer-checked:translate-x-4 flex items-center justify-center"
        >
          {#if $theme === "dark"}
            <Moon size={10} class="text-main" />
          {:else}
            <Sun size={10} class="text-main" />
          {/if}
        </div>
      </label>
    </ul>
  </div>
</nav>
