<script lang="ts">
  import { theme } from "$lib/stores/theme";

  function toggleTheme() {
    theme.update((value) => (value === "light" ? "dark" : "light"));
  }

  function scrollToTop() {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  const currentDate = new Date(2026, 10);
  const currentMonth = currentDate.toLocaleString("default", { month: "long" });
  const currentYear = currentDate.getFullYear();
</script>

<footer
  class="mt-auto relative z-10 bg-surface border-t border-primary py-8 px-6"
>
  <div
    class="max-w-5xl mx-auto flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-sm text-secondary-text font-mono"
  >
    <!-- left -->
    <div>Last updated: {currentMonth} {currentYear}</div>

    <!-- right -->
    <div class="flex flex-wrap items-center gap-x-6 gap-y-3">
      <button
        onclick={toggleTheme}
        class="hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-4 transition-colors cursor-pointer"
      >
        {$theme === "light" ? "dark mode" : "light mode"}
      </button>
      <button
        onclick={scrollToTop}
        class="hover:text-primary transition-colors cursor-pointer"
      >
        back to top ↑
      </button>
    </div>
  </div>
</footer>
