<script lang="ts">
  import StickyNote from "$lib/components/StickyNote.svelte";
  import NoteViewer from "$lib/components/NoteViewer.svelte";
  import { noteTilt } from "$lib/stickyNote";
  import type { Project } from "$lib/types";

  let { data }: { data: { projects: Project[] } } = $props();

  // Featured first: the notes stuck up on the home page lead the grid here too.
  let projects = $derived([
    ...data.projects.filter((p) => p.featured),
    ...data.projects.filter((p) => !p.featured),
  ]);
  let noteViewer = $state<NoteViewer>();
</script>

<div class="projects-page mx-auto w-full flex flex-col">
  <h1>Projects</h1>
  {#if projects.length === 0}
    <p class="page-lede">
      Check out my <a
        href="https://github.com/nicbat"
        target="_blank"
        rel="noopener noreferrer">Github</a
      > if you want to see some of my work.
    </p>
  {:else}
    <p class="page-lede">
      Everything I've made, big and small. Pick one up for a closer look.
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

  /* One column on phones: note text is sized from the note's width (so it scales cleanly when
     picked up), and two columns would make it too small to read. */
  @media (max-width: 639px) {
    .note-grid {
      grid-template-columns: minmax(0, 20rem);
      justify-content: center;
      gap: 1.75rem;
    }
  }
</style>
