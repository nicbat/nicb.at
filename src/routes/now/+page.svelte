<script lang="ts">
  import type { PageData } from "./$types";

  let { data }: { data: PageData } = $props();
  const { updated, html } = data;
</script>

<div class="flex flex-col gap-6">
  <div class="flex flex-col gap-2">
    <h1 class="text-4xl font-medium">Now</h1>
    <p class="font-mono text-sm text-secondary-text">
      Check out
      <a href="https://nownownow.com/about" target="_blank">nownownow</a>!
    </p>
  </div>

  <!-- eslint-disable-next-line svelte/no-at-html-tags -->
  <div class="now-content text-lg leading-relaxed text-primary-text">
    {@html html}
  </div>

  <p class="text-sm text-secondary-text">Last updated {updated}.</p>
</div>

<style>
  /* Match the previous hand-written markup: bulleted, indented list with
     spacing between items, and a gap before the following paragraph. */
  .now-content :global(ul) {
    list-style: disc;
    padding-left: 1.5rem;
    margin-top: 0.75rem;
    margin-bottom: 1.75rem;
  }

  .now-content :global(li + li) {
    margin-top: 0.5rem;
  }
</style>
