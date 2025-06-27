<script lang="ts">
  import { onMount } from 'svelte';
  import { theme } from '$lib/stores/theme';
  import '../lib/styles/layout.css';
  import Navbar from '../lib/components/Navbar.svelte';
  import Footer from '../lib/components/Footer.svelte';

  onMount(() => {
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' || 'light';
    theme.set(savedTheme);
    document.body.setAttribute('data-theme', savedTheme);
  });

  theme.subscribe((value: string) => {
    if (typeof document !== 'undefined') {
      document.body.setAttribute('data-theme', value);
    }
  });
</script>

<div class="min-h-screen flex flex-col bg-white dark:bg-gray-900 text-gray-900 dark:text-white font-sans">
  <Navbar />
  <div class="flex-1 max-w-7xl mx-auto w-full px-5 flex flex-col">
    <main class="flex-1 min-h-0 py-5">
      <slot />
    </main>
  </div>
  <Footer />
</div>
