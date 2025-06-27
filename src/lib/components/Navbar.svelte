<script lang="ts">
  import { Moon, Sun, Github } from 'lucide-svelte';
  import { theme } from '$lib/stores/theme';

  function toggleTheme(): void {
    theme.update(t => t === 'light' ? 'dark' : 'light');
  }
</script>

<nav class="sticky top-0 z-50 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-2">
  <div class="max-w-7xl mx-auto flex justify-between items-center">
    <div class="logo">
      <a href="/" class="text-2xl font-bold text-gray-900 dark:text-white hover:text-gray-700 dark:hover:text-gray-300 transition-colors">
        nicbat
      </a>
    </div>
    <ul class="flex items-center space-x-6">
      <li>
        <a href="/photos">
          Photos
        </a>
      </li>
      <li>
        <a href="/projects">
          Projects
        </a>
      </li>
      <li>
        <a href="/blog">
          Blog
        </a>
      </li>
      <li>
        <a href="https://github.com/nicbat" target="_blank" rel="noopener noreferrer">
          <Github size={24} />
        </a>
      </li>
      <li>
        <button 
          on:click={toggleTheme} 
          aria-label="Toggle dark mode" 
          class="text-sm"
        >
          {#if $theme === 'dark'}
            <Sun size={24} />
          {:else}
            <Moon size={24} />
          {/if}
        </button>
      </li>
    </ul>
  </div>
</nav>

