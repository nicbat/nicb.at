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

<div class="project-card">
  {#if project.image !== ""}
    <img src={project.image} alt={project.title} />
  {/if}
  <div class="project-content">
    <div class="header">
      <h2>{@html formatMarkdown(project.title)}</h2>
      <div class="tags">
        {#each project.tags as tag}
          <span class="tag {tag.toLowerCase()}">{tag}</span>
        {/each}
      </div>
    </div>
    {#if project.date !== ""}
      <p class="date">{new Date(project.date).toLocaleDateString()}</p>
    {/if}
    <p class="description">{@html formatMarkdown(project.description)}</p>
    <div class="links">
      {#each project.links as link}
        <a href={link.url} target="_blank" rel="noopener noreferrer">{link.text}</a>
      {/each}
    </div>
  </div>
</div>

<style>
  .project-card {
    border: 1px solid var(--nav-border-color);
    border-radius: 8px;
    overflow: hidden;
    transition: transform 0.2s ease-in-out;
    background: var(--nav-bg-color);
    margin-bottom: 2rem;
  }

  .project-card:hover {
    transform: translateY(-4px);
  }

  .project-card img {
    width: 100%;
    height: 200px;
    object-fit: cover;
  }

  .project-content {
    padding: 1.5rem;
  }

  .header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 1rem;
    margin-bottom: 0.5rem;
  }

  .project-content h2 {
    margin: 0;
    font-size: 1.5rem;
    flex: 1;
  }

  .date {
    color: #666;
    font-size: 0.9rem;
    margin-bottom: 1rem;
  }

  .description {
    margin-bottom: 1.5rem;
  }

  .description :global(a) {
    color: inherit;
    text-decoration: underline;
  }

  .description :global(strong) {
    font-weight: 600;
  }

  .description :global(em) {
    font-style: italic;
  }

  .links {
    display: flex;
    gap: 1rem;
    flex-wrap: wrap;
  }

  .links a {
    display: inline-block;
    text-decoration: none;
    font-weight: bold;
  }

  .links a:hover {
    text-decoration: underline;
  }

  .tags {
    display: flex;
    gap: 0.5rem;
    flex-shrink: 0;
  }

  .tag {
    padding: 0.25rem 0.75rem;
    border-radius: 999px;
    font-size: 0.75rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .tag.publication {
    background-color: #f0f9ff;
    color: #0369a1;
  }

  .tag.product {
    background-color: #f0fdf4;
    color: #166534;
  }

  /* Dark mode support for tags */
  :global([data-theme="dark"]) .tag.publication {
    background-color: rgba(3, 105, 161, 0.2);
    color: #7dd3fc;
  }

  :global([data-theme="dark"]) .tag.product {
    background-color: rgba(22, 101, 52, 0.2);
    color: #86efac;
  }
</style> 