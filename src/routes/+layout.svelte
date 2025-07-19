<script lang="ts">
  import { theme } from '$lib/stores/theme';
  import '../lib/styles/layout.css';
  import Navbar from '../lib/components/Navbar.svelte';
  import Footer from '../lib/components/Footer.svelte';

  $effect(() => {
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' || 'light';
    theme.set(savedTheme);
    document.body.setAttribute('data-theme', savedTheme);
  });

  $effect(() => {
    const unsubscribe = theme.subscribe((value: string) => {
      if (typeof document !== 'undefined') {
        document.body.setAttribute('data-theme', value);
      }
    });
    
    return unsubscribe;
  });
</script>

<div class="min-h-screen flex flex-col bg-main text-primary-text font-sans">
  <Navbar />
  <div class="flex-1 max-w-7xl mx-auto w-full px-5 flex flex-col">
    <main class="flex-1 min-h-0 py-5">
      <slot />
    </main>
  </div>
  <Footer />
</div>
