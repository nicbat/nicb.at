<script lang="ts">
  // No imports needed - using Tailwind classes
  
  // Colophon component
  let showColophon = false;
  let timeoutId: number | undefined;
  
  function handleMouseEnter() {
    clearTimeout(timeoutId);
    showColophon = true;
  }
  
  function handleMouseLeave() {
    timeoutId = setTimeout(() => {
      showColophon = false;
    }, 100);
  }
</script>

<footer class="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 py-3 text-center text-sm text-gray-600 dark:text-gray-400">
  &copy; 2025 Nicholas Batchelder • 
  
  <!-- Colophon Component -->
  <div class="relative inline-block">
    <button 
      class="text-green-600 dark:text-green-400 hover:underline"
      on:mouseenter={handleMouseEnter}
      on:mouseleave={handleMouseLeave}
    >
      colophon
    </button>
    
    {#if showColophon}
      <div 
        class="absolute bottom-full left-1/2 transform -translate-x-1/2 mt-2 px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg text-xs text-gray-600 dark:text-gray-400 whitespace-nowrap z-10"
        role="tooltip"
        on:mouseenter={handleMouseEnter}
        on:mouseleave={handleMouseLeave}
      >
        <div class="text-center">
          <div class="font-semibold mb-2 text-gray-800 dark:text-gray-200">Built with</div>
          <div class="space-y-1">
            <div><a href='https://neovim.io/' class="text-green-600 dark:text-green-400 hover:underline">Neovim</a></div>
            <div><a href='https://svelte.dev/' class="text-green-600 dark:text-green-400 hover:underline">SvelteKit</a></div>
          </div>
          <div class="mt-2 pt-2 border-t border-gray-200 dark:border-gray-600">
            <a href="https://github.com/nicbat/nicb.at" class="text-green-600 dark:text-green-400 hover:underline">Source code</a>
          </div>
        </div>
        <!-- Arrow pointing up -->
        <!-- <div class="absolute bottom-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-white dark:border-t-gray-800"></div> -->
      </div>
    {/if}
  </div>
</footer>
