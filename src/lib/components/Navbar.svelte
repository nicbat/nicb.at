<script lang="ts">
  import { Moon, Sun, Github } from 'lucide-svelte';
  import { theme } from '$lib/stores/theme';

  function toggleTheme(): void {
    theme.update(t => t === 'light' ? 'dark' : 'light');
  }

  let isHovered = $state(false);
</script>

<nav class="sticky top-0 z-50 bg-surface border-b border-primary px-4 py-2">
  <div class="max-w-7xl mx-auto flex justify-between items-center">
    <div class="logo">
      <a href="/" class="text-2xl font-bold text-primary-text hover:text-secondary-text">
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
      <button 
          onclick={toggleTheme} 
          aria-label="Toggle dark mode" 
          class="text-sm cursor-pointer"
          onmouseenter={() => {
            isHovered = true;
          }}
          onmouseleave={() => isHovered = false}
        >
          {#if $theme === 'dark'}
            <Sun size={24} class="group-hover:text-primary" color={isHovered ? "var(--color-primary)" : "var(--color-text-primary)"}/>
          {:else}
            <Moon size={24} class="group-hover:text-primary" color={isHovered ? "var(--color-primary)" : "var(--color-text-primary)"}/>
          {/if}
      </button>
    </ul>
  </div>
</nav>

