<script lang="ts">
  import StickyNote from "$lib/components/StickyNote.svelte";
  import NoteViewer from "$lib/components/NoteViewer.svelte";
  import { noteTilt } from "$lib/stickyNote";
  import type { Project } from "$lib/types";

  let { data }: { data: { projects: Project[] } } = $props();

  // Featured first, so the notes that were stuck up on the home page land in the first row.
  let projects = $derived([
    ...data.projects.filter((p) => p.featured),
    ...data.projects.filter((p) => !p.featured),
  ]);
  let noteViewer = $state<NoteViewer>();
</script>

<div class="projects-page mx-auto w-full flex flex-col">
  <a href="/" class="mb-6 self-start text-sm">Back to home</a>
  <h1 class="mb-4">Projects</h1>
  {#if projects.length === 0}
    <p class="mb-6 text-secondary-text">
      Check out my <a
        href="https://github.com/nicbat"
        target="_blank"
        rel="noopener noreferrer">Github</a
      > if you want to see some of my work.
    </p>
  {:else}
    <p class="mb-8 text-secondary-text">
      Everything I've made, big and small. Pick one up for the details.
    </p>
    <div class="note-grid">
      {#each projects as project (project.id)}
        <StickyNote
          {project}
          tilt={noteTilt(project.id)}
          onopen={(note) => noteViewer?.open(project, note)}
        />
      {/each}
    </div>
  {/if}
</div>

<NoteViewer bind:this={noteViewer} />

<style>
  .projects-page {
    /* The same width as the home page, so a note is the same size on both. */
    max-width: 56rem;
  }

  .note-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(15rem, 1fr));
    gap: 2rem 1.75rem;
    padding-bottom: 1rem;
  }

  @media (max-width: 639px) {
    .note-grid {
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 1.25rem 1rem;
    }
  }
</style>
