<script lang="ts">
  import type { PageData } from "./$types";

  let { data }: { data: PageData } = $props();
  const { updated, html } = data;
</script>

<div class="flex flex-col gap-6">
  <a href="/" class="self-start text-sm">Back to home</a>
  <div class="flex flex-col gap-2">
    <h1 class="text-4xl font-medium">Now</h1>
    <p class="font-mono text-sm text-secondary-text">
      Check out
      <a href="https://nownownow.com/about" target="_blank">nownownow</a>!
    </p>
  </div>

  <!-- eslint-disable-next-line svelte/no-at-html-tags -->
  <div class="now-content markdown-content text-lg leading-relaxed text-primary-text">
    {@html html}
  </div>

  <p class="text-sm text-secondary-text">Last updated {updated}.</p>
</div>
