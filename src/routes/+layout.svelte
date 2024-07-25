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

<div>
  <Navbar />
  <div class="container">
    <main>
      <slot />
    </main>
  </div>
  <Footer />
</div>
