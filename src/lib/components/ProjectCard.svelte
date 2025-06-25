<script lang="ts">
  import type { Project } from '$lib/types';
  
  export let project: Project;

  function formatMarkdown(text: string): string {
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');
  }
</script>

<div class="border border-gray-300 rounded-lg p-4 dark:bg-neutral-800 dark:border-neutral-700">
  {#if project.image !== ""}
    <img src={project.image} alt={project.title} />
  {/if}
  <div class="project-content">
    <article class="">
      <div class="flex flex-row justify-between float-right">
        {#each project.tags as tag}
          {#if tag == "Publication"}
            <span class="bg-emerald-700/25 rounded-full p-2 text-xs font-bold uppercase text-emerald-700 dark:text-emerald-300">{tag}</span>
            <!-- <span class="bg-yellow-700/25 rounded-full p-2 text-xs font-bold uppercase text-yellow-700 dark:text-yellow-300">{tag}</span> -->
          {:else}
            <span class="bg-cyan-700/25 rounded-full p-2 text-xs font-bold uppercase text-cyan-700 dark:text-cyan-300">{tag}</span>
          {/if}
        {/each}
      </div>
      <p class="text-lg font-bold">{@html formatMarkdown(project.title)}</p>
    </article>
    {#if project.date !== ""}
      <span class="text-gray-500 text-sm">{new Date(project.date).toLocaleDateString()}</span>
    {/if}
    <p class="description">{@html formatMarkdown(project.description)}</p>
    <div class="links">
      {#each project.links as link}
        <a href={link.url} target="_blank" rel="noopener noreferrer">{link.text}</a>
      {/each}
    </div>
  </div>
</div>