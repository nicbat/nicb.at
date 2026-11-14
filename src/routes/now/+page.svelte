<script lang="ts">
  import type { PageData } from "./$types";

  let { data }: { data: PageData } = $props();
  const { updated, html } = data;
</script>

<div class="flex flex-col">
  <h1>Now</h1>
  <p class="page-lede">
    Check out
    <a href="https://nownownow.com/about" target="_blank">nownownow</a>!
  </p>

  <!-- eslint-disable-next-line svelte/no-at-html-tags -->
  <div class="now-content markdown-content text-lg leading-relaxed text-primary-text">
    {@html html}
  </div>

  <p class="mt-6 text-sm text-secondary-text">Last updated {updated}.</p>
</div>
