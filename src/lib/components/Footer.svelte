<script lang="ts">
  function scrollToTop() {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  const currentDate = new Date();
  const currentMonth = currentDate.toLocaleString("default", { month: "long" });
  const currentYear = currentDate.getFullYear();
</script>

<footer class="mt-auto py-12 px-5">
  <div
    class="max-w-3xl mx-auto flex justify-between items-center text-sm text-secondary-text font-mono"
  >
    <div>
      Last updated: {currentMonth}
      {currentYear}
    </div>

    <button
      onclick={scrollToTop}
      class="hover:text-primary-text transition-colors cursor-pointer"
    >
      back to top ↑
    </button>
  </div>
</footer>
