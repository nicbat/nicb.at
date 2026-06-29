<script lang="ts">
  import ProjectCard from "$lib/components/ProjectCard.svelte";
  import { Masonry } from "@nicbat/svelte-masonry";
  import type { Project } from "$lib/types";

  export let data: { projects: Project[] };

  // TDOO would love to have filters on this page when it gets full enough
  // - being able to filter out serious things from fun things
</script>

<div>
  <h1>Projects</h1>
  {#if data.projects.length === 0}
    <p>
      Check out my <a
        href="https://github.com/nicbat"
        target="_blank"
        rel="noopener noreferrer">Github</a
      > if you want to see some of my work.
    </p>
  {:else}
    <p class="text-secondary-text">
      Here are some of my projects - many more to come!
    </p>
    <Masonry
      class="projects-grid"
      items={data.projects}
      getKey={(project) => project.title + project.date}
      minColumnWidth={320}
      gap={32}
      readingOrder="source"
    >
      {#snippet children(project)}
        <ProjectCard {project} />
      {/snippet}
    </Masonry>
  {/if}
</div>

<style>
  :global(.projects-grid) {
    padding: 1rem 0;
  }
</style>
