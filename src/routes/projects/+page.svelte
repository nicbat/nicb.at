<script lang="ts">
  import ProjectCard from '$lib/components/ProjectCard.svelte';
  import type { Project } from '$lib/types';

  export let data: { projects: Project[] };
  
  // TDOO would love to have filters on this page when it gets full enough
  // - being able to filter out serious things from fun things
</script>

<div class="projects">
  <h1>Projects</h1>
  <p>Here's some of my projects - ranging from toys to many-month works. Many (many) more to come soon!</p>
  {#if data.projects.length === 0}
    <p>No projects yet. Check out my <a href='https://github.com/nicbat' target='_blank' rel="noopener noreferrer">Github</a> if you want to see some of my work.</p>
  {:else}
    <div class="projects-grid">
      {#each data.projects as project}
        <ProjectCard {project} />
      {/each}
    </div>
  {/if}
</div>

<style>
  .projects-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 2rem;
    padding: 1rem 0;
  }

  @media (max-width: 640px) {
    .projects-grid {
      grid-template-columns: 1fr;
    }
  }
</style>
