<script lang="ts">
  import '../styles/navbar.css';
  import { Moon, Sun, Github } from 'lucide-svelte';
  import { theme } from '$lib/stores/theme';

  function toggleTheme(): void {
    theme.update(t => t === 'light' ? 'dark' : 'light');
  }
</script>

<nav>
  <div class="nav-content">
    <div class="logo">
      <a href="/">nicbat</a>
    </div>
    <ul class="nav-links">
      <li><a href="/photos">Photos</a></li>
      <li><a href="/projects">Projects</a></li>
      <li><a href="/blog">Blog</a></li>
      <li>
        <a href="https://github.com/nicbat" target="_blank" rel="noopener noreferrer">
          <Github size={24} />
        </a>
      </li>
      <li>
        <!-- TODO make this button same height as rest of row, it's slightly too tall -->
        <button on:click={toggleTheme} aria-label="Toggle dark mode" class="m-0 p-0">
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

